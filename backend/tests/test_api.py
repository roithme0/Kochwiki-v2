from fastapi.testclient import TestClient

from app.models.enums import Unit


def create_foodstuff(client: TestClient, **overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "name": "Oats",
        "brand": "",
        "unit": "G",
        "kcal": 370,
        "carbs": 60,
        "protein": 13,
        "fat": 7,
    }
    payload.update(overrides)
    response = client.post("/foodstuffs", json=payload)
    assert response.status_code == 201
    return response.json()


def test_recipe_contract_persists_order_and_derives_nutrition(client: TestClient) -> None:
    oats = create_foodstuff(client)
    egg = create_foodstuff(
        client,
        name="Egg",
        unit="PIECE",
        kcal=78,
        carbs=1,
        protein=6,
        fat=5,
    )

    response = client.post(
        "/recipes",
        json={
            "name": "Oat breakfast",
            "servings": 2,
            "preptime": 10,
            "originName": "Home",
            "originUrl": "https://example.com/oats",
            "ingredients": [
                {"index": 2, "amount": 2, "foodstuffId": egg["id"]},
                {"index": 1, "amount": 50, "foodstuffId": oats["id"]},
            ],
            "steps": [
                {"index": 2, "description": "Serve"},
                {"index": 1, "description": "Cook"},
            ],
        },
    )

    assert response.status_code == 201
    recipe = response.json()
    assert recipe["kcal"] == 170.5
    assert recipe["carbs"] == 16
    assert recipe["protein"] == 9.25
    assert recipe["fat"] == 6.75
    assert [ingredient["foodstuff"]["name"] for ingredient in recipe["ingredients"]] == ["Oats", "Egg"]
    assert set(recipe["ingredients"][0]) == {"id", "index", "amount", "foodstuff", "recipeId"}
    assert "recipeIds" not in recipe["ingredients"][0]["foodstuff"]
    assert [step["description"] for step in recipe["steps"]] == ["Cook", "Serve"]

    persisted = client.get(f"/recipes/{recipe['id']}")
    assert persisted.status_code == 200
    assert persisted.json() == recipe
    assert client.get("/ingredients").json()[0]["recipeId"] == recipe["id"]
    assert client.get("/steps").json()[0]["recipeId"] == recipe["id"]


def test_missing_nutrition_makes_recipe_total_unknown(client: TestClient) -> None:
    foodstuff = create_foodstuff(client, kcal=None)
    response = client.post(
        "/recipes",
        json={
            "name": "Unknown calories",
            "servings": 1,
            "ingredients": [{"index": 1, "amount": 100, "foodstuffId": foodstuff["id"]}],
        },
    )

    assert response.status_code == 201
    assert response.json()["kcal"] is None
    assert response.json()["carbs"] == 60


def test_referenced_foodstuff_cannot_be_deleted(client: TestClient) -> None:
    foodstuff = create_foodstuff(client)
    recipe = client.post(
        "/recipes",
        json={
            "name": "Uses oats",
            "servings": 1,
            "ingredients": [{"index": 1, "amount": 100, "foodstuffId": foodstuff["id"]}],
        },
    ).json()

    conflict = client.delete(f"/foodstuffs/{foodstuff['id']}")
    assert conflict.status_code == 409
    assert conflict.json()["statusCode"] == 409
    assert client.delete(f"/recipes/{recipe['id']}").status_code == 204
    assert client.delete(f"/foodstuffs/{foodstuff['id']}").status_code == 204


def test_typed_patch_replaces_recipe_ingredients_and_keeps_totals_derived(client: TestClient) -> None:
    oats = create_foodstuff(client)
    egg = create_foodstuff(client, name="Egg", unit="PIECE", kcal=78, carbs=1, protein=6, fat=5)
    recipe = client.post(
        "/recipes",
        json={
            "name": "Patchable recipe",
            "servings": 1,
            "ingredients": [{"index": 1, "amount": 100, "foodstuffId": oats["id"]}],
        },
    ).json()

    patched_recipe = client.patch(
        f"/recipes/{recipe['id']}",
        json={
            "servings": 2,
            "originName": "Family cookbook",
            "originUrl": "https://example.com/patchable-recipe",
            "ingredients": [{"index": 1, "amount": 3, "foodstuffId": egg["id"]}],
            "steps": [{"index": 1, "description": "Mix"}],
        },
    )

    assert patched_recipe.status_code == 200
    assert patched_recipe.json()["kcal"] == 117
    assert patched_recipe.json()["originName"] == "Family cookbook"
    assert patched_recipe.json()["originUrl"] == "https://example.com/patchable-recipe"
    assert [ingredient["foodstuff"]["name"] for ingredient in patched_recipe.json()["ingredients"]] == ["Egg"]
    patched_foodstuff = client.patch(f"/foodstuffs/{egg['id']}", json={"kcal": 80, "brand": ""})
    assert patched_foodstuff.status_code == 200
    assert patched_foodstuff.json()["brand"] is None
    assert client.get(f"/recipes/{recipe['id']}").json()["kcal"] == 120


def test_user_has_no_shopping_list_side_effect(client: TestClient) -> None:
    created = client.post("/users", json={"username": "Roi"})

    assert created.status_code == 201
    assert created.json() == {"id": 1, "username": "Roi"}
    assert client.get("/users/Roi").status_code == 200
    assert client.get("/users/missing").status_code == 404
    assert client.get("/shoppingLists/1").status_code == 404


def test_recipe_name_and_foodstuff_membership_are_unique(client: TestClient) -> None:
    foodstuff = create_foodstuff(client)
    recipe_payload = {
        "name": "Unique recipe",
        "servings": 1,
        "ingredients": [{"index": 1, "amount": 100, "foodstuffId": foodstuff["id"]}],
    }

    assert client.post("/recipes", json=recipe_payload).status_code == 201
    duplicate_recipe = client.post("/recipes", json=recipe_payload)
    assert duplicate_recipe.status_code == 409
    duplicate_foodstuff = client.post(
        "/recipes",
        json={
            "name": "Duplicate membership",
            "servings": 1,
            "ingredients": [
                {"index": 1, "amount": 50, "foodstuffId": foodstuff["id"]},
                {"index": 2, "amount": 50, "foodstuffId": foodstuff["id"]},
            ],
        },
    )
    assert duplicate_foodstuff.status_code == 409


def test_validation_and_metadata_contracts(client: TestClient) -> None:
    invalid = client.post("/foodstuffs", json={"name": "Missing required values"})

    assert invalid.status_code == 422
    assert invalid.json()["statusCode"] == 422
    null_name = client.patch("/foodstuffs/1", json={"name": None})
    assert null_name.status_code == 422
    assert null_name.json()["details"][0]["msg"] == "Value error, name cannot be null"
    assert client.patch("/foodstuffs/1", json={"unit": None}).status_code == 422
    assert client.patch("/recipes/1", json={"name": None}).status_code == 422
    assert client.patch("/recipes/1", json={"servings": None}).status_code == 422
    assert client.patch("/recipes/1", json={"originUrl": "not a valid URL"}).status_code == 422
    assert client.get("/foodstuffs-meta-data/unit-choices").json() == {
        unit.value: unit.verbose_name for unit in Unit
    }
    assert client.get("/meta/version").headers["content-type"].startswith("text/plain")

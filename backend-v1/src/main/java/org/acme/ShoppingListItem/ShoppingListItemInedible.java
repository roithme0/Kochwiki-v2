// package org.acme.ShoppingListItem;

// import org.acme.FoodstuffMetaData.UnitEnum;
// import org.acme.Inedbile.Inedbile;

// import io.quarkus.hibernate.orm.panache.PanacheEntity;
// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;

// @Entity
// public class ShoppingListItemInedible extends PanacheEntity implements
// IShoppingListItem {
// // #region fields

// @Column(nullable = false)
// public Boolean isChecked;

// @Column(nullable = false)
// public Inedbile inedible;

// // #endregion

// // #region getters

// public Boolean getIsChecked() {
// return this.isChecked;
// }

// public String getName() {
// return this.inedible.getName();
// }

// public String getBrand() {
// return this.inedible.getBrand();
// }

// public Float getAmount() {
// return this.inedible.amount;
// }

// public UnitEnum getUnit() {
// return this.inedible.getUnit();
// }

// public String getUnitVerbose() {
// return this.inedible.getUnitVerbose();
// }

// // #endregion

// // #region constructors

// /**
// * Default constructor for hibernate.
// */
// public ShoppingListItemInedible() {
// }

// /**
// * @param paramInedible
// */
// public ShoppingListItemInedible(Inedbile paramInedible) {
// this.isChecked = false;
// this.inedible = paramInedible;
// }

// // #endregion
// }

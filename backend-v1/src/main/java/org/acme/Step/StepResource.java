package org.acme.Step;

import java.util.Map;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class StepResource implements PanacheRepository<Step> {
    public Step patch(Step step, final Map<String, Object> updates) {
        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            switch (key) {
                case "description":
                    step.description = (String) value;
                    break;
                default:
                    break;
            }
        }
        return step;
    }
}

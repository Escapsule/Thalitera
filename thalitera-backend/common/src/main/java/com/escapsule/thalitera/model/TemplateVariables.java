package com.escapsule.thalitera.model;

import com.escapsule.thalitera.json.Jsonb;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public abstract class TemplateVariables extends Jsonb {
    private final Map<String, Object> variables = new HashMap<>();

    protected TemplateVariables bind(String key, Object value) {
        variables.put(key, value);
        return this;
    }

    public Map<String, Object> toMap() {
        return Collections.unmodifiableMap(variables);
    }
}

package com.example.Gig.Worker.Insurance.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Converter
@Component
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private final EncryptionUtil encryptionUtil;

    // These values come from application.properties
    public EncryptedStringConverter(
            @Value("${encryption.secret-key}") String secretKey,
            @Value("${encryption.init-vector}") String initVector) {
        this.encryptionUtil = new EncryptionUtil(secretKey, initVector);
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        return encryptionUtil.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return encryptionUtil.decrypt(dbData);
    }
}
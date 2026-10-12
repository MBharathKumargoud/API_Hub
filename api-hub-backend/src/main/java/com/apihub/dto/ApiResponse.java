package com.apihub.dto;

import com.apihub.entity.Api;

/**
 * Same field names as the objects in the frontend's apiData.js, so React components
 * (ApiCard, Explore, ApiDetails...) keep working unchanged.
 * Note: "id" is the slug (e.g. "openai"), not the numeric database id.
 */
public record ApiResponse(
        String id,
        String name,
        String category,
        String provider,
        String description,
        String icon,
        String color,
        String authentication,
        String baseUrl,
        String documentation,
        String website,
        String freeTier,
        String pricing) {

    public static ApiResponse from(Api a) {
        return new ApiResponse(a.getSlug(), a.getName(), a.getCategory(), a.getProvider(),
                a.getDescription(), a.getIcon(), a.getColor(), a.getAuthenticationType(),
                a.getBaseUrl(), a.getDocumentationUrl(), a.getWebsiteUrl(),
                a.getFreeTier(), a.getPricing());
    }
}

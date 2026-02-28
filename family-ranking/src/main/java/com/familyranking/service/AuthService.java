package com.familyranking.service;

import com.familyranking.dto.request.AuthRequest;
import com.familyranking.dto.response.Response;

public interface AuthService {
    Response.AuthToken register(AuthRequest.Register request);
    Response.AuthToken login(AuthRequest.Login request);
}

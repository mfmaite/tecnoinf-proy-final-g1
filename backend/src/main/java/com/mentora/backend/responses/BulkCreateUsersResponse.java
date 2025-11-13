package com.mentora.backend.responses;

import com.mentora.backend.dt.DtUser;

import java.util.List;

public class BulkCreateUsersResponse {
    private List<DtUser> createdUsers;
    private List<String> errors;

    public BulkCreateUsersResponse(List<DtUser> createdUsers, List<String> errors) {
        this.createdUsers = createdUsers;
        this.errors = errors;
    }

    public List<DtUser> getCreatedUsers() { return createdUsers; }
    public List<String> getErrors() { return errors; }
}


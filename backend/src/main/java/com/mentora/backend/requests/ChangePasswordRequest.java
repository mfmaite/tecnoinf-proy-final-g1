package com.mentora.backend.requests;

public class ChangePasswordRequest {
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
    private String userCi;

    public String getOldPassword() { return oldPassword; }
    public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getUserCi() { return userCi; }
    public void setUserCi(String userCi) { this.userCi = userCi; }
}

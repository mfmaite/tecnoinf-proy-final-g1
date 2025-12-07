import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ResetPasswordScreen from "../(auth)/reset-password";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Alert } from "react-native";

// ==== MOCKS ====
jest.mock("axios");
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

describe("ResetPasswordScreen", () => {
  let mockReplace;
  let mockAlert;

  beforeEach(() => {
    mockReplace = jest.fn();
    mockAlert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    useRouter.mockReturnValue({ replace: mockReplace });
    useLocalSearchParams.mockReturnValue({ token: "fake-token" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------
  test("muestra error si token no existe", async () => {
    useLocalSearchParams.mockReturnValue({ token: undefined });
    const { getByText } = render(<ResetPasswordScreen />);
    fireEvent.press(getByText("Cambiar contraseña"));

    expect(mockAlert).toHaveBeenCalledWith("Error", "Token inválido o faltante.");
  });

  // -------------------------------
  test("muestra error si campos vacíos", async () => {
    const { getByText } = render(<ResetPasswordScreen />);
    fireEvent.press(getByText("Cambiar contraseña"));

    expect(mockAlert).toHaveBeenCalledWith("Error", "Por favor completa todos los campos.");
  });

  // -------------------------------
  test("muestra error si las contraseñas no coinciden", async () => {
    const { getByText, getByPlaceholderText } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText("Nueva contraseña"), "Password123");
    fireEvent.changeText(getByPlaceholderText("Confirmar contraseña"), "Password456");

    fireEvent.press(getByText("Cambiar contraseña"));

    expect(mockAlert).toHaveBeenCalledWith("Error", "Las contraseñas no coinciden.");
  });

  // -------------------------------
  test("muestra error si la contraseña no cumple regex", async () => {
    const { getByText, getByPlaceholderText } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText("Nueva contraseña"), "short");
    fireEvent.changeText(getByPlaceholderText("Confirmar contraseña"), "short");

    fireEvent.press(getByText("Cambiar contraseña"));

    expect(mockAlert).toHaveBeenCalledWith(
      "Contraseña inválida",
      "Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
    );
  });

  // -------------------------------
  test("reset exitoso llama axios y navega al login", async () => {
    axios.post.mockResolvedValueOnce({});

    const { getByText, getByPlaceholderText } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText("Nueva contraseña"), "Password123");
    fireEvent.changeText(getByPlaceholderText("Confirmar contraseña"), "Password123");

    fireEvent.press(getByText("Cambiar contraseña"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://10.0.2.2:8080/api/users/reset-password",
        { token: "fake-token", newPassword: "Password123", confirmPassword: "Password123" }
      );
      expect(mockAlert).toHaveBeenCalledWith(
        "Éxito",
        "Contraseña restablecida correctamente.",
        expect.any(Array)
      );
    });
  });

  // -------------------------------
  test("error del servidor muestra alerta con mensaje", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Error de servidor" } },
    });

    const { getByText, getByPlaceholderText } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText("Nueva contraseña"), "Password123");
    fireEvent.changeText(getByPlaceholderText("Confirmar contraseña"), "Password123");

    fireEvent.press(getByText("Cambiar contraseña"));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("Error", "Error de servidor");
    });
  });

  // -------------------------------
  test("error genérico muestra alerta si no hay message", async () => {
    axios.post.mockRejectedValueOnce({});

    const { getByText, getByPlaceholderText } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText("Nueva contraseña"), "Password123");
    fireEvent.changeText(getByPlaceholderText("Confirmar contraseña"), "Password123");

    fireEvent.press(getByText("Cambiar contraseña"));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Error",
        "Error al restablecer la contraseña. Inténtalo de nuevo."
      );
    });
    
  });
});

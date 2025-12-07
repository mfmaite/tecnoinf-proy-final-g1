import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ForgotPasswordScreen from "../(auth)/forgot-password"; // ajustá path
import { useRouter } from "expo-router";
import { api } from "../../services/api";
import { Alert } from "react-native";

// ==== MOCKS ====
jest.mock("../../services/api");
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("ForgotPasswordScreen", () => {
  let mockPush: jest.Mock;
  let mockAlert: jest.SpyInstance;

  beforeEach(() => {
    mockPush = jest.fn();
    mockAlert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------
  test("muestra error si email está vacío", async () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    fireEvent.press(getByText("Enviar instrucciones"));

    expect(getByText("Por favor ingresá tu correo electrónico")).toBeTruthy();
  });

  // -------------------------------
  test("envío exitoso llama api y navega al login", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({});
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    fireEvent.changeText(getByPlaceholderText("Correo electrónico"), "test@mail.com");
    fireEvent.press(getByText("Enviar instrucciones"));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/users/password-recovery", { params: { email: "test@mail.com" } });
      expect(mockAlert).toHaveBeenCalledWith(
        "Solicitud enviada",
        "Si el correo existe, recibirás un email con instrucciones para restablecer tu contraseña."
      );
      expect(mockPush).toHaveBeenCalledWith("/(auth)/login");
    });
  });

  // -------------------------------
  test("error de API muestra mensaje de error", async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error("Server error"));
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    fireEvent.changeText(getByPlaceholderText("Correo electrónico"), "test@mail.com");
    fireEvent.press(getByText("Enviar instrucciones"));

    await waitFor(() => {
      expect(getByText("No se pudo enviar el correo. Intentá nuevamente más tarde.")).toBeTruthy();
    });
  });

  // -------------------------------
  test("botón deshabilitado mientras loading", async () => {
    let resolveApi: Function;
    (api.get as jest.Mock).mockImplementation(
      () => new Promise((res) => { resolveApi = res; })
    );

    const { getByText, getByPlaceholderText, queryByText } = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText("Correo electrónico"), "test@mail.com");
    fireEvent.press(getByText("Enviar instrucciones"));
    
    expect(queryByText("Enviar instrucciones")).toBeNull();
      resolveApi();

  });

});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPassword } from "../app/login/components/forgot-password";
import { userController } from "@/controllers/userController";

// 🧩 Mocks de dependencias externas

jest.mock('@/public/assets/icons/mentora-logo.svg', () => 'MockedLogo');
jest.mock('@/controllers/userController', () => ({
    userController: {
        forgotPassword: jest.fn(),
    },
}));

describe("ForgotPassword", () => {

    const backMock = jest.fn();
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

    afterAll(() => {
        consoleErrorMock.mockRestore();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("muestra error si el mail esta vacio", async () => {
        render(<ForgotPassword onBack={backMock} />);

        const submitButton = screen.getByRole("button", { name: /enviar email/i });
        await userEvent.click(submitButton);

        expect(await screen.findByText(/el email es requerido/i)).toBeInTheDocument();
    });
    test("vuelve a inicio de sesion", async () => {
        render(<ForgotPassword onBack={backMock} />);

        const link = screen.getByRole("link", { name: /Volver al login/i });
        await userEvent.click(link);

        expect(backMock).toHaveBeenCalled();
    });
    test("muestra error si falla", async () => {
        userController.forgotPassword.mockRejectedValue(new Error("fail"));

        render(<ForgotPassword onBack={backMock} />);

        const input = screen.getByLabelText(/email/i);
        await userEvent.type(input, "test@test.com");

        const submitBtn = screen.getByRole("button", { name: /enviar email/i });
        await userEvent.click(submitBtn);

        expect(await screen.findByText(/error al enviar/i)).toBeInTheDocument();
    });
    test("muestra exito si succes y vuelve al login", async () => {
        userController.forgotPassword.mockResolvedValue({success: true, message: "Email enviado"});

        render(<ForgotPassword onBack={backMock} />);

        await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
        await userEvent.click(screen.getByRole("button", { name: /enviar email/i }));

        expect(await screen.findByText(/email enviado/i)).toBeInTheDocument();

        await userEvent.click(screen.getByRole("link", { name: /volver al login/i }));

        expect(backMock).toHaveBeenCalled();
    });
    
});
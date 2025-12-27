import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePasswordModal } from "../app/(logged)/profile/components/change-password-modal";
import { userController } from "@/controllers/userController";

// 🧩 Mocks de dependencias externas

jest.mock("@/controllers/userController", () => ({
  userController: {
    changePassword: jest.fn(),
  },
}));

jest.mock("@/components/modal/modal", () => {
  return ({ children, footer }: any) => (
    <div>
      {children}
      <div>{footer}</div>
    </div>
  );
});

jest.mock("next/image", () => (props: any) => {
  return <img {...props} alt={props.alt || "img"} />;
});


describe("ChangePasswordModal", () => {
    const onCloseMock = jest.fn();
    const accessToken = "token123";
    
    beforeEach(() => jest.clearAllMocks());
    
    test("deshabilita el botón si los campos están vacíos", () => {
    render(
      <ChangePasswordModal
        isOpen
        onClose={onCloseMock}
        accessToken={accessToken}
      />
    );

    const button = screen.getByRole("button", { name: /guardar/i });
    expect(button).toBeDisabled();
  });
    test("muestra error si las contraseñas no coinciden", async () => {
        render(
        <ChangePasswordModal
            isOpen
            onClose={onCloseMock}
            accessToken={accessToken}
        />
        );

        await userEvent.type(
        screen.getByLabelText("Nueva contraseña"),
        "12345678"
        );
        await userEvent.type(
        screen.getByLabelText("Confirmar nueva contraseña"),
        "1234567"
        );

        expect(
        screen.getByText(/las contraseñas no coinciden/i)
        ).toBeInTheDocument();
    });
    test("muestra error si la nueva contraseña es muy corta", async () => {
        render(
        <ChangePasswordModal
            isOpen
            onClose={onCloseMock}
            accessToken={accessToken}
        />
        );

        await userEvent.type(
        screen.getByLabelText("Nueva contraseña"),
        "123"
        );

        expect(
        screen.getByText(/debe tener al menos 8 caracteres/i)
        ).toBeInTheDocument();
    });
    test("llama a la API correctamente", async () => {
        (userController.changePassword as jest.Mock).mockResolvedValue({
        success: true,
        });

        render(
        <ChangePasswordModal
            isOpen
            onClose={onCloseMock}
            accessToken={accessToken}
        />
        );

        await userEvent.type(
        screen.getByLabelText(/contraseña actual/i),
        "oldpass"
        );
        await userEvent.type(
        screen.getByLabelText("Nueva contraseña"),
        "abcdefgh"
        );
        await userEvent.type(
        screen.getByLabelText("Confirmar nueva contraseña"),
        "abcdefgh"
        );

        const button = screen.getByRole("button", { name: /guardar/i });
        expect(button).toBeEnabled();

        await userEvent.click(button);

        expect(userController.changePassword).toHaveBeenCalledWith(
        {
            oldPassword: "oldpass",
            newPassword: "abcdefgh",
            confirmPassword: "abcdefgh",
        },
        accessToken
        );
    });    
    test("muestra mensaje de error si la API falla", async () => {
        (userController.changePassword as jest.Mock).mockResolvedValue({
        success: false,
        message: "Error X",
        });

        render(
        <ChangePasswordModal
            isOpen
            onClose={onCloseMock}
            accessToken={accessToken}
        />
        );

        await userEvent.type(
        screen.getByLabelText(/contraseña actual/i),
        "oldpass"
        );
        await userEvent.type(
        screen.getByLabelText("Nueva contraseña"),
        "abcdefgh"
        );
        await userEvent.type(
        screen.getByLabelText("Confirmar nueva contraseña"),
        "abcdefgh"
        );

        const button = screen.getByRole("button", { name: /guardar/i });
        await userEvent.click(button);

        expect(screen.getByText(/error x/i)).toBeInTheDocument();
    });
});
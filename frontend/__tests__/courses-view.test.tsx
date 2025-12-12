import { render, screen, within, waitFor } from "@testing-library/react";
import CourseView from "../app/(logged)/courses/[courseId]/page";
import { courseController } from "@/controllers/courseController";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import userEvent from "@testing-library/user-event";

// 🧩 Mocks de dependencias externas

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

jest.mock('@/controllers/courseController', () => ({
    courseController: {
        getCourseById: jest.fn(),
        getParticipants: jest.fn(),
    }
}));

jest.mock('@/controllers/forumController', () => ({
    forumController: {
        getForumById: jest.fn(),
    }
}));

describe("CourseView", () => {
    
    const mockPush = jest.fn();
    const mockCourse = {
        course: {
            id: "CURSO1",
            name: "NOMBRE CURSO",
            createdDate: "2024-01-31",
        },
        contents: [],
        forums: [{ id: "FOROA", type: "ANNOUNCEMENTS" },
                { id: "FOROC", type: "CONSULTS" }]
    };
    const mockCourse2 = {
        course: {
            id: "CURSO1",
            name: "NOMBRE CURSO",
            createdDate: "2024-01-31",
        },
        contents: [],
        forums: []
    };

    beforeEach(() => {

        (useAuth as jest.Mock).mockReturnValue({
            accessToken: "fake-token",
            isLoading: false,
            isAuthenticated: true,
            user: { role: "PROFESOR" },
        });

        (useRouter as jest.Mock).mockReturnValue({ 
            push: mockPush 
        });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: () => null,
        });

        jest.clearAllMocks();
    });

    test("muestra mensaje de carga mientras no se obtiene data", async () => {
        
        courseController.getCourseById.mockImplementation(
            () => new Promise(() => {})
        );

        render(<CourseView params={{ courseId: "CURSO1" }} />);

        expect(screen.getByText(/cargando curso/i)).toBeInTheDocument();
    });

    test("muestra los datos del curso cuando se cargan (nombre, fecha, id)", async () => {
        courseController.getCourseById.mockResolvedValue({
            success: true,
            data: mockCourse
        });

        render(<CourseView params={{ courseId: "CURSO1" }} />);

        expect(await screen.findByText(/NOMBRE CURSO/i)).toBeInTheDocument();
        expect(screen.getByText(/creado/i)).toBeInTheDocument();
        expect(screen.getByText(/id: CURSO1/i)).toBeInTheDocument();
    });

    test("muestra error si el controlador devuelve error", async () => {
        courseController.getCourseById.mockResolvedValue({
            success: false,
            message: "Error al cargar curso",
        });

        render(<CourseView params={{ courseId: "CURSO1" }} />);

        expect(await screen.findByText(/no se pudo cargar el curso/i)).toBeInTheDocument();
        expect(screen.getByText("Error al cargar curso")).toBeInTheDocument();
    });

    test("manejo del link participantes", async () => {

        courseController.getCourseById.mockResolvedValue({
            success: true,
            data: mockCourse,
        });

        render(<CourseView params={{ courseId: "CURSO1" }} />);
        
        const courseName = await screen.findByText("NOMBRE CURSO"); //espera a que cargue el curso
        const link = screen.getByRole("link", { name: "Participantes" });

        expect(link).toHaveAttribute("href", "/courses/CURSO1/participants");
    });

    test("manejo de links si hay foros", async () => {
        
        courseController.getCourseById.mockResolvedValue({
            success: true,
            data: mockCourse,
        });

        render(<CourseView params={{ courseId: "CURSO1" }} />);
        
        const courseName = await screen.findByText("NOMBRE CURSO"); //espera a que cargue el curso
        
        expect(screen.getByRole("link", { name: "Foro de Anuncios" })).toHaveAttribute("href", "/courses/CURSO1/forums/FOROA");
        expect(screen.getByRole("link", { name: "Foro de Consultas" })).toHaveAttribute("href", "/courses/CURSO1/forums/FOROC");
    });
    test("manejo de links no hay foros", async () => {
        
        courseController.getCourseById.mockResolvedValue({
            success: true,
            data: mockCourse2,
        });

        render(<CourseView params={{ courseId: "CURSO1" }} />);
        
        const courseName = await screen.findByText("NOMBRE CURSO"); //espera a que cargue el curso
        
        expect(screen.queryByText(/Foro de Anuncios/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Foro de Consultas/i)).not.toBeInTheDocument();
    });
    test("muestra mensaje de éxito cuando se crea contenido", async () => {
        
        (useSearchParams as jest.Mock).mockReturnValue({
            get: (key: string) => (key === "created" ? "1" : null),
        });

        courseController.getCourseById.mockResolvedValue({
            success: true,
            data: mockCourse
        });
        
        render(<CourseView params={{ courseId: "CURSO1" }} />);

        const courseName = await screen.findByText("NOMBRE CURSO"); //espera a que cargue el curso
        expect(screen.getByText("Contenido temático creado correctamente.")).toBeInTheDocument();

    });

    test("muestra mensaje de éxito cuando se crea contenido", async () => {
        
        (useSearchParams as jest.Mock).mockReturnValue({
            get: (key: string) => (key === "created" ? "1" : null),
        });

        courseController.getCourseById.mockResolvedValue({
            success: true,
            data: mockCourse
        });
        
        render(<CourseView params={{ courseId: "CURSO1" }} />);

        const courseName = await screen.findByText("NOMBRE CURSO"); //espera a que cargue el curso
        expect(screen.getByText("Contenido temático creado correctamente.")).toBeInTheDocument();

    });

    test("no muestra boton Agregar contenido temático si es estudiante", async () => {
        
        (useAuth as jest.Mock).mockReturnValue({
            accessToken: "fake-token2",
            isLoading: false,
            isAuthenticated: true, 
            user: { role: "ESTUDIANTE" },
        });

        courseController.getCourseById.mockResolvedValue({
            success: true,
            data: mockCourse
        });
        
        render(<CourseView params={{ courseId: "CURSO1" }} />);

        const courseName = await screen.findByText("NOMBRE CURSO"); //espera a que cargue el curso

        expect(screen.queryByText(/Agregar contenido temático/i)).not.toBeInTheDocument();

    });
    test("muestra el Modal al presionar Agregar contenido temático", async () => {

        courseController.getCourseById.mockResolvedValue({
            success: true,
            data: mockCourse,
        });

        render(<CourseView params={{ courseId: "CURSO1" }} />);

        await screen.findByText("NOMBRE CURSO");

        const button = screen.getByText("Agregar contenido temático");
        await userEvent.click(button);

        expect(
            await screen.findByText("Seleccione el tipo de contenido que desea crear")
        ).toBeInTheDocument();

        expect(screen.getByText("Contenido Simple")).toBeInTheDocument();
        expect(screen.getByText("Evaluación")).toBeInTheDocument();
        expect(screen.getByText("Quiz")).toBeInTheDocument();
        
        const simpleButton = screen.getByText("Contenido Simple");
        await userEvent.click(simpleButton);

        expect(mockPush).toHaveBeenCalledWith("/courses/CURSO1/contents/simple");

    });
});
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CourseView from "../(courses)/[courseId]/index"; 
import { getCourseById } from "../../services/courses";

import { useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";
import * as Sharing from "expo-sharing";
import { File } from "expo-file-system";

describe("CoursesView", () => {

    jest.mock("expo-router", () => ({
        useRouter: () => ({ push: jest.fn() }),
        useLocalSearchParams: jest.fn(),
    }));

    jest.mock("../../services/courses", () => ({
        getCourseById: jest.fn(),
    }));

    jest.mock("expo-sharing", () => ({
        isAvailableAsync: jest.fn(),
        shareAsync: jest.fn(),
    }));

    jest.mock("react-native/Libraries/Linking/Linking", () => ({
        openURL: jest.fn(),
        canOpenURL: jest.fn(),
    }));

    test("muestra loader mientras carga", () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ courseId: "10" });

        (getCourseById as jest.Mock).mockReturnValue(new Promise(() => {}));

        
        const { getByTestId } = render(<CourseView />);

        expect(getByTestId("ActivityIndicator")).toBeTruthy();
    });
/*
    test("muestra mensaje de error si falla la carga", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ courseId: "10" });

        (getCourseById as jest.Mock).mockRejectedValueOnce({
            message: "Error forzado",
        });

        const { getByText } = render(<CourseView />);

        await waitFor(() => {
            expect(getByText("Error forzado")).toBeTruthy();
        });
    });

    test("renderiza datos del curso correctamente", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ courseId: "10" });

        (getCourseById as jest.Mock).mockResolvedValueOnce({
            course: {
            id: 10,
            name: "Curso Test",
            createdDate: "2024-12-31",
            forums: [],
            },
            contents: [],
        });

        const { getByText } = render(<CourseView />);

        await waitFor(() => {
            expect(getByText("ID: 10")).toBeTruthy();
            expect(getByText("Contenidos")).toBeTruthy();
        });
    });

    test("renderiza contenido con links clicables", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ courseId: "10" });

        (getCourseById as jest.Mock).mockResolvedValueOnce({
            course: {
            id: 10,
            name: "Curso Test",
            createdDate: "2024-12-31",
            forums: [],
            },
            contents: [
            {
                id: 1,
                title: "Material",
                content: "Ir a https://google.com",
            },
            ],
        });

        const { getByText } = render(<CourseView />);

        const link = await waitFor(() => getByText("https://google.com"));

        expect(link).toBeTruthy();
    });

    test("abre enlace al presionar link", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ courseId: "10" });

        (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

        (getCourseById as jest.Mock).mockResolvedValueOnce({
            course: { id: 10, name: "Curso", createdDate: "2024-12-31", forums: [] },
            contents: [
            { id: 1, title: "Material", content: "Ver https://example.com" },
            ],
        });

        const { getByText } = render(<CourseView />);

        const link = await waitFor(() => getByText("https://example.com"));

        fireEvent.press(link);

        expect(Linking.openURL).toHaveBeenCalledWith("https://example.com");
    });

    test("descarga archivo y lo comparte", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ courseId: "10" });

        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
        (Sharing.shareAsync as jest.Mock).mockResolvedValue(true);

        // Mock descarga
        jest.spyOn(File, "downloadFileAsync").mockResolvedValue({
            uri: "file:///document/test.pdf",
        });

        (getCourseById as jest.Mock).mockResolvedValueOnce({
            course: { id: 10, name: "Curso", createdDate: "2024-12-31", forums: [] },
            contents: [
            {
                id: 1,
                title: "PDF",
                content: "",
                fileName: "test.pdf",
                fileUrl: "https://server.com/test.pdf",
            },
            ],
        });

        const { getByText } = render(<CourseView />);

        const btn = await waitFor(() => getByText("Descargar"));
        fireEvent.press(btn);

        expect(File.downloadFileAsync).toHaveBeenCalledWith(
            "https://server.com/test.pdf",
            expect.anything()
        );

        expect(Sharing.shareAsync).toHaveBeenCalledWith("file:///document/test.pdf");
    });
    test("muestra mensaje vacío si no hay contenidos", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ courseId: "10" });

        (getCourseById as jest.Mock).mockResolvedValueOnce({
            course: { id: 10, name: "Curso", createdDate: "2024-12-31", forums: [] },
            contents: [],
        });

        const { getByText } = render(<CourseView />);

        await waitFor(() =>
            expect(getByText("No hay contenidos disponibles.")).toBeTruthy()
        );
    });
*/
});
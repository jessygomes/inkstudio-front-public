"use server";
import { httpErrorMessage } from "@/lib/user-error";
import { actionError } from "@/lib/action-error";

export type PublicArticle = {
	id: string;
	title: string;
	content: string;
	author: string;
	imageUrls: string[];
	createdAt: string;
	updatedAt: string;
};

type ApiError = {
	error: boolean;
	message: string;
};

const getBackUrl = () => {
	const backUrl = process.env.NEXT_PUBLIC_BACK_URL;
	if (!backUrl) {
		throw actionError("NEXT_PUBLIC_BACK_URL est manquant dans les variables d'environnement");
	}
	return backUrl;
};

const fetchPublicArticlesApi = async <T>(path: string): Promise<T> => {
	const response = await fetch(`${getBackUrl()}${path}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	let data: T | ApiError | null = null;
	try {
		data = await response.json();
	} catch {
		throw actionError("Réponse invalide du serveur articles");
	}

	if (!response.ok) {
		const apiMessage =
			data && typeof data === "object" && "message" in data
				? String(data.message)
				: httpErrorMessage(response.status);
		throw actionError(apiMessage);
	}

	if (
		data &&
		typeof data === "object" &&
		"error" in data &&
		data.error === true
	) {
		const message = "message" in data ? String(data.message) : "Erreur API articles";
		throw actionError(message);
	}

	return data as T;
};

export const getPublicArticlesAction = async (): Promise<PublicArticle[]> => {
	return fetchPublicArticlesApi<PublicArticle[]>("/articles");
};

export const getLatestPublicArticlesAction = async (): Promise<PublicArticle[]> => {
	return fetchPublicArticlesApi<PublicArticle[]>("/articles/latest");
};

export const getPublicArticleByIdAction = async (
	id: string,
): Promise<PublicArticle> => {
	if (!id) {
		throw actionError("ID article invalide");
	}

	return fetchPublicArticlesApi<PublicArticle>(`/articles/${id}`);
};

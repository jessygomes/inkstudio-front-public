import type { PortfolioProps } from "@/lib/type";

type PortfolioPagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export type PortfolioPhotosResponse = {
	photos: PortfolioProps[];
	pagination: PortfolioPagination;
};

type PortfolioPhotosOptions = {
	tatoueurId?: string | null;
	page?: number;
};

export const getPortfolioPhotosAction = async (
	userId: string,
	options: PortfolioPhotosOptions = {},
) => {
	try {
		if (!userId || !userId.trim()) {
			return {
				ok: false,
				error: true,
				status: 400,
				message: "ID utilisateur manquant pour récupérer le portfolio",
				data: null,
			};
		}

		const baseUrl = process.env.NEXT_PUBLIC_BACK_URL;
		if (!baseUrl) {
			throw new Error("NEXT_PUBLIC_BACK_URL est manquant dans les variables d'environnement");
		}

		const params = new URLSearchParams();
		if (options.tatoueurId?.trim()) {
			params.set("tatoueurId", options.tatoueurId.trim());
		}
		if (typeof options.page === "number" && options.page > 0) {
			params.set("page", String(options.page));
		}

		const query = params.toString();
		const url = `${baseUrl}/portfolio/${encodeURIComponent(userId)}${query ? `?${query}` : ""}`;

		const response = await fetch(url, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
			cache: "no-store",
		});

		const data = await response.json();

		if (!response.ok || data?.error) {
			const message =
				data?.message ||
				`Erreur lors de la récupération des photos du portfolio (${response.status})`;
			return { ok: false, error: true, status: response.status, message, data };
		}

		return {
			ok: true,
			error: false,
			status: response.status,
			data: data as PortfolioPhotosResponse,
		};
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des photos du portfolio :",
			error,
		);
		throw error;
	}
};

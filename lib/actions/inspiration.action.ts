"use server";

type InspirationSalon = {
	id: string;
	salonName: string | null;
	image: string | null;
	city: string | null;
	postalCode: string | null;
	instagram?: string | null;
	isInspirationSalon: boolean;
};

type InspirationTatoueur = {
	id: string;
	name: string;
	img: string | null;
	description: string | null;
	instagram: string | null;
};

export type InspirationPhoto = {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
	style: string[];
	createdAt: string;
	updatedAt: string;
	user: InspirationSalon;
	tatoueur: InspirationTatoueur | null;
};

export type InspirationPagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export type InspirationPhotosResponse = {
	photos: InspirationPhoto[];
	pagination: InspirationPagination;
	source: "mock" | "api";
};

export type InspirationFilterOptions = {
	cities: string[];
	styles: string[];
	source: "mock" | "api";
};

type ApiError = {
	error?: boolean;
	message?: string;
};

type InspirationActionOptions = {
	page?: number;
	limit?: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const USE_INSPIRATION_MOCK_DATA =
	process.env.NEXT_PUBLIC_USE_INSPIRATION_MOCK !== "false";

const MOCK_INSPIRATION_PHOTOS: InspirationPhoto[] = [
	{
		id: "mock-1",
		title: "Blackwork organique",
		description: "Lignes fluides et ombrages profonds.",
		imageUrl: "/photos/AI%20Art.jpg",
		style: ["blackwork"],
		createdAt: "2026-05-01T10:00:00.000Z",
		updatedAt: "2026-05-01T10:00:00.000Z",
		user: {
			id: "salon-mock-1",
			salonName: "Ligne Noire",
			image: "/photos/AI%20Art.jpg",
			city: "Paris",
			postalCode: "75011",
			instagram: "ligne.noire.paris",
			isInspirationSalon: true,
		},
		tatoueur: {
			id: "tatoueur-mock-1",
			name: "Nora",
			img: "/photos/AI%20Art.jpg",
			description: "Spécialiste blackwork et compositions organiques.",
			instagram: "the.inkera",
		},
	},
	{
		id: "mock-2",
		title: "Fine line floral",
		description: "Composition florale en tracé fin.",
		imageUrl: "/photos/Gorgeous.jpg",
		style: ["fine-line", "floral"],
		createdAt: "2026-05-02T10:00:00.000Z",
		updatedAt: "2026-05-02T10:00:00.000Z",
		user: {
			id: "salon-mock-2",
			salonName: "Atelier Eden",
			image: "/photos/Gorgeous.jpg",
			city: "Lyon",
			postalCode: "69002",
			instagram: "https://instagram.com/atelier.eden",
			isInspirationSalon: true,
		},
		tatoueur: {
			id: "tatoueur-mock-2",
			name: "Mila",
			img: "/photos/Gorgeous.jpg",
			description: "Tatouages floraux en trait fin.",
			instagram: "the.inkera",
		},
	},
	{
		id: "mock-3",
		title: "Piece japonaise",
		description: "Contraste fort et mouvement.",
		imageUrl: "/photos/complete.jpg",
		style: ["japonais"],
		createdAt: "2026-05-03T10:00:00.000Z",
		updatedAt: "2026-05-03T10:00:00.000Z",
		user: {
			id: "salon-mock-3",
			salonName: "Kuro Studio",
			image: "/photos/complete.jpg",
			city: "Marseille",
			postalCode: "13006",
			isInspirationSalon: true,
		},
		tatoueur: {
			id: "tatoueur-mock-3",
			name: "Kenji",
			img: "/photos/complete.jpg",
			description: "Pieces japonaises a fort contraste.",
			instagram: "the.inkera",
		},
	},
	{
		id: "mock-4",
		title: "Motif graphique",
		description: "Approche geometrique moderne.",
		imageUrl: "/photos/assis.jpg",
		style: ["graphique"],
		createdAt: "2026-05-04T10:00:00.000Z",
		updatedAt: "2026-05-04T10:00:00.000Z",
		user: {
			id: "salon-mock-4",
			salonName: "Obsidian Ink",
			image: "/photos/assis.jpg",
			city: "Bordeaux",
			postalCode: "33000",
			isInspirationSalon: true,
		},
		tatoueur: null,
	},
	{
		id: "mock-5",
		title: "Old school color",
		description: "Palette vive et contour marque.",
		imageUrl: "/photos/drink.jpg",
		style: ["old-school", "couleur"],
		createdAt: "2026-05-05T10:00:00.000Z",
		updatedAt: "2026-05-05T10:00:00.000Z",
		user: {
			id: "salon-mock-5",
			salonName: "Rouge 13",
			image: "/photos/drink.jpg",
			city: "Lille",
			postalCode: "59000",
			isInspirationSalon: true,
		},
		tatoueur: {
			id: "tatoueur-mock-5",
			name: "Sam",
			img: "/photos/drink.jpg",
			description: "Couleurs vives et contour old school.",
			instagram: "the.inkera",
		},
	},
	{
		id: "mock-6",
		title: "Dark ornamental",
		description: "Textures denses et finesse des details.",
		imageUrl: "/photos/goth.jpg",
		style: ["ornemental", "dark"],
		createdAt: "2026-05-06T10:00:00.000Z",
		updatedAt: "2026-05-06T10:00:00.000Z",
		user: {
			id: "salon-mock-6",
			salonName: "Nocturne",
			image: "/photos/goth.jpg",
			city: "Nantes",
			postalCode: "44000",
			isInspirationSalon: true,
		},
		tatoueur: null,
	},
	{
		id: "mock-7",
		title: "Minimal symbol",
		description: "Micro-tatouage a haute precision.",
		imageUrl: "/photos/metro.jpg",
		style: ["minimal"],
		createdAt: "2026-05-07T10:00:00.000Z",
		updatedAt: "2026-05-07T10:00:00.000Z",
		user: {
			id: "salon-mock-7",
			salonName: "Mono Ink",
			image: "/photos/metro.jpg",
			city: "Toulouse",
			postalCode: "31000",
			isInspirationSalon: true,
		},
		tatoueur: {
			id: "tatoueur-mock-7",
			name: "Elsa",
			img: "/photos/metro.jpg",
			description: "Micro tattoos et symboles minimalistes.",
			instagram: "the.inkera",
		},
	},
	{
		id: "mock-8",
		title: "Polynesian pattern",
		description: "Trame inspiree des traditions insulaires.",
		imageUrl: "/photos/recherche.jpg",
		style: ["polynesien"],
		createdAt: "2026-05-08T10:00:00.000Z",
		updatedAt: "2026-05-08T10:00:00.000Z",
		user: {
			id: "salon-mock-8",
			salonName: "Mana Atelier",
			image: "/photos/recherche.jpg",
			city: "Montpellier",
			postalCode: "34000",
			isInspirationSalon: true,
		},
		tatoueur: null,
	},
	{
		id: "mock-9",
		title: "Rouge contrast",
		description: "Encrage contraste sur fond neutre.",
		imageUrl: "/photos/red.jpg",
		style: ["couleur"],
		createdAt: "2026-05-09T10:00:00.000Z",
		updatedAt: "2026-05-09T10:00:00.000Z",
		user: {
			id: "salon-mock-9",
			salonName: "Velvet Needle",
			image: "/photos/red.jpg",
			city: "Nice",
			postalCode: "06000",
			isInspirationSalon: true,
		},
		tatoueur: null,
	},
	{
		id: "mock-10",
		title: "Neo tribal",
		description: "Volumetrie maitrisee et rythme graphique.",
		imageUrl: "/photos/sit.jpg",
		style: ["tribal"],
		createdAt: "2026-05-10T10:00:00.000Z",
		updatedAt: "2026-05-10T10:00:00.000Z",
		user: {
			id: "salon-mock-10",
			salonName: "Ancre Atelier",
			image: "/photos/sit.jpg",
			city: "Rennes",
			postalCode: "35000",
			isInspirationSalon: true,
		},
		tatoueur: null,
	},
	{
		id: "mock-11",
		title: "Typo serif",
		description: "Lettrage subtil et equilibre.",
		imageUrl: "/photos/X.jpg",
		style: ["lettrage"],
		createdAt: "2026-05-11T10:00:00.000Z",
		updatedAt: "2026-05-11T10:00:00.000Z",
		user: {
			id: "salon-mock-11",
			salonName: "Serif Ink",
			image: "/photos/X.jpg",
			city: "Strasbourg",
			postalCode: "67000",
			isInspirationSalon: true,
		},
		tatoueur: null,
	},
	{
		id: "mock-12",
		title: "Heavy black",
		description: "Aplats noirs nets et puissants.",
		imageUrl: "/photos/blk.jpg",
		style: ["blackwork"],
		createdAt: "2026-05-12T10:00:00.000Z",
		updatedAt: "2026-05-12T10:00:00.000Z",
		user: {
			id: "salon-mock-12",
			salonName: "Bloc Noir",
			image: "/photos/blk.jpg",
			city: "Grenoble",
			postalCode: "38000",
			isInspirationSalon: true,
		},
		tatoueur: {
			id: "tatoueur-mock-12",
			name: "Iris",
			img: "/photos/blk.jpg",
			description: "Grandes masses noires et compositions fortes.",
			instagram: "the.inkera",
		},
	},
];

const clampPagination = (options?: InspirationActionOptions) => {
	const page = Number.isFinite(options?.page) ? Number(options?.page) : DEFAULT_PAGE;
	const limit = Number.isFinite(options?.limit)
		? Number(options?.limit)
		: DEFAULT_LIMIT;

	return {
		page: page > 0 ? page : DEFAULT_PAGE,
		limit: Math.min(MAX_LIMIT, Math.max(1, limit || DEFAULT_LIMIT)),
	};
};

const buildMockResponse = (
	page: number,
	limit: number,
): InspirationPhotosResponse => {
	const total = MOCK_INSPIRATION_PHOTOS.length;
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const safePage = Math.min(page, totalPages);
	const start = (safePage - 1) * limit;
	const photos = MOCK_INSPIRATION_PHOTOS.slice(start, start + limit);

	return {
		photos,
		pagination: {
			page: safePage,
			pageSize: limit,
			total,
			totalPages,
			hasNextPage: safePage < totalPages,
			hasPreviousPage: safePage > 1,
		},
		source: "mock",
	};
};

const getUniqueSortedValues = (values: Array<string | null | undefined>) => {
	const uniqueValues = Array.from(
		new Set(
			values
				.map((value) => (typeof value === "string" ? value.trim() : ""))
				.filter(Boolean),
		),
	);

	return uniqueValues.sort((first, second) => first.localeCompare(second, "fr"));
};

const buildMockFilterOptions = (): InspirationFilterOptions => {
	const cities = getUniqueSortedValues(
		MOCK_INSPIRATION_PHOTOS.map((photo) => photo.user.city),
	);
	const styles = getUniqueSortedValues(
		MOCK_INSPIRATION_PHOTOS.flatMap((photo) => photo.style),
	);

	return {
		cities,
		styles,
		source: "mock",
	};
};

const getBackUrl = () => {
	const backUrl = process.env.NEXT_PUBLIC_BACK_URL;
	if (!backUrl) {
		throw new Error("NEXT_PUBLIC_BACK_URL est manquant dans les variables d'environnement");
	}

	return backUrl;
};

const fetchInspirationPhotosFromApi = async (
	page: number,
	limit: number,
): Promise<InspirationPhotosResponse> => {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	const response = await fetch(
		`${getBackUrl()}/portfolio/inspirations?${params.toString()}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-store",
		},
	);

	let data: InspirationPhotosResponse | ApiError | null = null;
	try {
		data = await response.json();
	} catch {
		throw new Error("Réponse invalide du serveur inspiration");
	}

	if (!response.ok) {
		const message =
			data && typeof data === "object" && "message" in data && data.message
				? String(data.message)
				: `Erreur API inspiration (${response.status})`;
		throw new Error(message);
	}

	if (data && typeof data === "object" && "error" in data && data.error) {
		throw new Error(data.message || "Erreur API inspiration");
	}

	return {
		...(data as Omit<InspirationPhotosResponse, "source">),
		source: "api",
	};
};

const fetchStringList = async (path: string): Promise<string[]> => {
	const response = await fetch(`${getBackUrl()}${path}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(`Erreur API inspiration (${response.status})`);
	}

	const data = await response.json();

	if (!Array.isArray(data)) {
		throw new Error("Réponse invalide pour les filtres inspiration");
	}

	return getUniqueSortedValues(data);
};

export const getInspirationPortfolioPhotosAction = async (
	options?: InspirationActionOptions,
): Promise<InspirationPhotosResponse> => {
	const { page, limit } = clampPagination(options);

	if (USE_INSPIRATION_MOCK_DATA) {
		return buildMockResponse(page, limit);
	}

	try {
		return await fetchInspirationPhotosFromApi(page, limit);
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des images d'inspiration, fallback mock activé :",
			error,
		);
		return buildMockResponse(page, limit);
	}
};

export const getInspirationFilterOptionsAction = async (): Promise<InspirationFilterOptions> => {
	if (USE_INSPIRATION_MOCK_DATA) {
		return buildMockFilterOptions();
	}

	try {
		const [cities, styles] = await Promise.all([
			fetchStringList("/users/cities"),
			fetchStringList("/users/styleTattoo"),
		]);

		return {
			cities,
			styles,
			source: "api",
		};
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des filtres inspiration, fallback mock activé :",
			error,
		);
		return buildMockFilterOptions();
	}
};
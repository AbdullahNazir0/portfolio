"use client";

import type React from "react";

import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

type SectionId = "home" | "about" | "experience" | "projects" | "contact";
const SECTIONS: SectionId[] = [
	"home",
	"about",
	"experience",
	"projects",
	"contact",
];

const SOCIALS = [
	{ label: "GitHub", href: "https://github.com/AbdullahNazir0" },
	{
		label: "LinkedIn",
		href: "https://www.linkedin.com/in/abdullah-nazir-3647b81ba",
	},
	{
		label: "Upwork",
		href: "https://www.upwork.com/freelancers/~01ab9f8a95cd182e76",
	},
];

function SocialLinks({ className }: { className?: string }) {
	return (
		<nav
			aria-label="Social links"
			className={cn("flex flex-wrap items-center gap-1", className)}
		>
			{SOCIALS.map((s) => (
				<Button
					key={s.href}
					asChild
					variant="ghost"
					size="sm"
					className="px-2"
				>
					<a
						href={s.href}
						target="_blank"
						rel="noreferrer noopener"
						aria-label={s.label}
						title={s.label}
					>
						{s.label}
					</a>
				</Button>
			))}
		</nav>
	);
}

export default function Page() {
	const [active, setActive] = useState<SectionId>("home");
	const headerRef = useRef<HTMLElement | null>(null);
	const sectionRefs = useMemo(
		() =>
			SECTIONS.reduce<
				Record<SectionId, React.RefObject<HTMLElement | null>>
			>(
				(acc, id) => {
					acc[id] = createRef<HTMLElement>();
					return acc;
				},
				{} as Record<SectionId, React.RefObject<HTMLElement>>,
			),
		[],
	);

	// Create actual refs after initial render
	useEffect(() => {
		SECTIONS.forEach((id) => {
			sectionRefs[id].current = document.getElementById(
				id,
			) as unknown as HTMLElement;
		});
		headerRef.current = document.getElementById(
			"site-header",
		) as HTMLElement | null;
	}, [sectionRefs]);

	// Intersection Observer to highlight active section
	useEffect(() => {
		const headerHeight = headerRef.current?.offsetHeight ?? 0;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = entry.target.id as SectionId;
					if (entry.isIntersecting) {
						setActive(id);
					} else {
						// When scrolling up, prefer the section that is closest to the top
						// We'll compute below using bounding rects
					}
				});

				// Fallback to closest section to top if multiple visible or none intersecting strongly
				const distances = SECTIONS.map((id) => {
					const el = sectionRefs[id].current;
					if (!el) return { id, d: Number.POSITIVE_INFINITY };
					const rect = el.getBoundingClientRect();
					const d = Math.abs(rect.top - (headerHeight + 24)); // 24px offset
					return { id, d };
				});
				distances.sort((a, b) => a.d - b.d);
				if (distances[0]) {
					const topId = distances[0].id;
					if (topId !== active) setActive(topId);
				}
			},
			{
				root: null,
				threshold: [0.3, 0.6],
				rootMargin: `-${(headerRef.current?.offsetHeight ?? 0) + 8}px 0px -40% 0px`,
			},
		);

		SECTIONS.forEach((id) => {
			const el = sectionRefs[id].current;
			if (el) observer.observe(el);
		});
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionRefs]);

	const handleNav = (id: SectionId) => (e: React.MouseEvent) => {
		e.preventDefault();
		const target = document.getElementById(id);
		if (!target) return;
		const headerHeight = headerRef.current?.offsetHeight ?? 0;
		const y =
			target.getBoundingClientRect().top +
			window.scrollY -
			headerHeight -
			12;
		window.scrollTo({ top: y, behavior: "smooth" });
	};

	return (
		<div className="min-h-dvh bg-background text-foreground font-sans">
			<a
				href="#home"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 rounded-md bg-accent px-3 py-2 text-accent-foreground"
			>
				Skip to content
			</a>

			<header
				id="site-header"
				ref={headerRef}
				className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
			>
				<div className="mx-auto max-w-6xl px-4">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center gap-2">
							<div
								aria-hidden
								className="h-6 w-6 rounded-md bg-primary/90"
							/>
							<span className="font-medium tracking-tight">
								Abdullah Nazir
							</span>
						</div>
						<nav aria-label="Primary" className="hidden md:block">
							<ul className="flex items-center gap-1">
								{SECTIONS.map((id) => (
									<li key={id}>
										<Button
											variant="ghost"
											className={cn(
												"relative data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
												"capitalize",
											)}
											data-active={active === id}
											aria-current={
												active === id
													? "page"
													: undefined
											}
											onClick={handleNav(id)}
										>
											{id}
											<span
												aria-hidden
												className={cn(
													"pointer-events-none absolute inset-x-2 -bottom-[9px] mx-auto h-0.5 rounded bg-primary transition-opacity",
													active === id
														? "opacity-100"
														: "opacity-0",
												)}
											/>
										</Button>
									</li>
								))}
							</ul>
						</nav>
						<div className="flex items-center gap-2">
							<SocialLinks className="hidden md:flex" />
							<Button asChild size="sm" variant="default">
								<a
									href="#contact"
									onClick={handleNav("contact")}
								>
									Contact
								</a>
							</Button>
						</div>
					</div>
				</div>

				{/* Mobile nav */}
				<div className="md:hidden border-t border-border/60">
					<div className="mx-auto max-w-6xl px-2 py-2">
						<div className="flex flex-wrap gap-1">
							{SECTIONS.map((id) => (
								<Button
									key={id}
									variant="ghost"
									size="sm"
									className="capitalize data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
									data-active={active === id}
									aria-current={
										active === id ? "page" : undefined
									}
									onClick={handleNav(id)}
								>
									{id}
								</Button>
							))}
						</div>
						<div className="flex flex-wrap gap-1 mt-4">
							<SocialLinks />
						</div>
					</div>
				</div>
			</header>

			<main>
				{/* HOME */}
				<section
					id="home"
					className="mx-auto max-w-6xl px-4 pt-16 pb-24 md:pt-20 md:pb-28"
				>
					<div className="grid gap-8 md:grid-cols-2 md:gap-12">
						<div className="flex flex-col justify-center">
							<Badge className="w-fit bg-accent text-accent-foreground">
								Available for work
							</Badge>
							<h1 className="mt-4 text-pretty text-4xl font-semibold tracking-tight md:text-5xl">
								Building fast, accessible web experiences
							</h1>
							<p className="mt-4 text-muted-foreground leading-relaxed">
								I’m a developer focused on crafting performant
								products with clean, scalable code and
								thoughtful UX. I specialize in Next.js,
								TypeScript, and modern UI systems.
							</p>
							<div className="mt-6 flex flex-wrap items-center gap-3">
								<Button asChild>
									<a
										href="#projects"
										onClick={handleNav("projects")}
									>
										View Projects
									</a>
								</Button>
								<Button asChild variant="outline">
									<a
										href="#contact"
										onClick={handleNav("contact")}
									>
										Get in Touch
									</a>
								</Button>
							</div>
							<ul className="mt-6 flex flex-wrap items-center gap-2">
								{[
									"Next.js",
									"TypeScript",
									"Tailwind",
									"shadcn/ui",
									"Supabase",
									"Neon",
									"Prisma",
								].map((s) => (
									<Badge
										key={s}
										variant="outline"
										className="font-normal"
									>
										{s}
									</Badge>
								))}
							</ul>
							{/* Social Profiles */}
							<div className="mt-6 flex flex-wrap items-center gap-3">
								<SocialLinks />
							</div>
						</div>

						<Card className="overflow-hidden">
							<CardContent className="relative p-0 h-80 md:h-auto aspect-[10/10]">
								<Image
									alt="Developer workspace with code and design elements"
									className="object-cover"
									fill
									src="/self.png"
								/>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* ABOUT */}
				<section
					id="about"
					className="mx-auto max-w-6xl px-4 py-16 md:py-24"
				>
					<div className="grid gap-8 md:grid-cols-3">
						<div className="md:col-span-1">
							<h2 className="text-2xl font-semibold tracking-tight text-pretty">
								About
							</h2>
							<p className="mt-2 text-muted-foreground">
								Who I am and how I work
							</p>
						</div>
						<div className="md:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle className="text-balance">
										Designer-minded developer with product
										instincts
									</CardTitle>
									<CardDescription>
										I bridge design and engineering to turn
										early ideas into scalable, market-ready
										products. My work blends thoughtful UX,
										robust architecture, and pragmatic
										execution.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4 leading-relaxed text-muted-foreground">
									<p>
										I collaborate with startups and teams to
										design, build, and scale complete
										products, from idea validation and UX
										design to implementation, documentation,
										and continuous improvement.
									</p>
									<p>
										I care deeply about accessibility,
										performance, budgets, and clean
										architecture. My approach emphasizes
										clarity, maintainability, and measurable
										impact.
									</p>
									<div className="flex flex-wrap gap-2 pt-2">
										{[
											"Accessibility",
											"Performance",
											"Scalability",
											"Design Systems",
											"Developer Experience",
											"Product Architecture",
										].map((item) => (
											<Badge
												key={item}
												variant="secondary"
											>
												{item}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* EXPERIENCE */}
				<section
					id="experience"
					className="mx-auto max-w-6xl px-4 py-16 md:py-24"
				>
					<div className="grid gap-8 md:grid-cols-3">
						<div className="md:col-span-1">
							<h2 className="text-2xl font-semibold tracking-tight text-pretty">
								Experience
							</h2>
							<p className="mt-2 text-muted-foreground">
								Roles, impact, and highlights
							</p>
						</div>
						<div className="md:col-span-2 space-y-4">
							{[
								{
									role: "Full Stack Software Engineer",
									company: "Assersoft",
									period: "Jan 2025 — Present",
									points: [
										"Developed a full-fledged ERP system for tailoring businesses with Next.js, HeroUI, Supabase, and modern design system components, integrating stock, orders, and ledger management.",
										"Designed and implemented a Laboratory Management Software from scratch, handling patient records, tests, and reporting workflows.",
										"Led architectural improvements including Next.js App Router migration and reusable component library with shadcn/ui for faster feature delivery.",
										"Collaborated with product and design teams to deliver end-to-end features from 0→1, emphasizing scalability, performance, and maintainability.",
										"Converted the Audiogram app into a multi-tenant SaaS platform, enabling scalable use across multiple clients.",
									],
								},
								{
									role: "Software Engineer Intern",
									company: "MaqMinds",
									period: "Feb 2025 — May 2025",
									points: [
										"Integrated Supabase with Retool to build dashboards and user forms for a real-world Anti-Money Laundering system.",
										"Gained hands-on experience with JavaScript, Retool, and libraries like Lodash and Moment for efficient data handling.",
										"Learned production-grade system design and optimization under mentorship from a senior engineer with 10+ years of industry experience.",
									],
								},
								{
									role: "Software Engineer Intern",
									company: "Assersoft",
									period: "Aug 2024 - Dec 2024",
									points: [
										"Built an advanced Audiogram app with Pure Tone, Speech, and Tympanogram modules to streamline audiological testing and analysis.",
										"Developed intuitive React + Tailwind interfaces for data input, visualization, and report generation.",
										"Engineered secure, real-time APIs with Node.js (Express) and MySQL for reliable test processing and storage.",
										"Collaborated with audiologists to translate clinical workflows into scalable, user-friendly software.",
									],
								},
							].map((job) => (
								<Card key={job.role}>
									<CardHeader className="pb-2">
										<CardTitle className="text-lg">
											{job.role} · {job.company}
										</CardTitle>
										<CardDescription>
											{job.period}
										</CardDescription>
									</CardHeader>
									<CardContent className="text-muted-foreground">
										<ul className="list-disc pl-5 space-y-2">
											{job.points.map((p) => (
												<li key={p}>{p}</li>
											))}
										</ul>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* PROJECTS */}
				<section
					id="projects"
					className="mx-auto max-w-6xl px-4 py-16 md:py-24"
				>
					<div className="flex flex-col gap-8">
						<div className="flex items-end justify-between">
							<div>
								<h2 className="text-2xl font-semibold tracking-tight text-pretty">
									Projects
								</h2>
								<p className="mt-2 text-muted-foreground">
									Selected work I’m proud of
								</p>
							</div>
							<Button asChild variant="outline">
								<a
									href="#contact"
									onClick={handleNav("contact")}
								>
									Work with me
								</a>
							</Button>
						</div>

						<div className="grid gap-6 md:grid-cols-2">
							{[
								{
									title: "Menu360",
									desc: "Menu360 is an interactive digital menu platform featuring 3D models and AR experiences to enhance restaurant ordering and customer engagement.",
									tags: [
										"Next.js",
										"Typescript",
										"Supabase",
										"Aceternity UI",
										"Three.js",
									],
									image: "/menu360.png",
									link: "https://menu360.com/demo",
								},
								{
									title: "Tailoring ERP",
									desc: `A full-featured ERP system for tailoring businesses, managing orders, stock, customers, and finances in a single scalable platform.
									username: master
									password: master123`,
									tags: [
										"Next.js",
										"TypeScript",
										"Hero UI",
										"Supabase",
									],
									image: "/tailoring.png",
									link: "https://teejays.vercel.app",
								},
								{
									title: "Learn Quran Global",
									desc: "Redesigned and optimized business website and reduced loading time significantly.",
									tags: ["Laravel", "Bootstrap", "MySQL"],
									image: "/learn-quran-global.png",
									link: "https://learnquranglobal.org",
								},
								{
									title: "Laboratory Management Software",
									desc: "A comprehensive laboratory management system streamlining patient records, test workflows, and reporting for efficient diagnostics.",
									tags: [
										"React.js",
										"Daisy UI",
										"JsPDF",
										"Codeignitor",
										"MySQL",
									],
									image: "/laboratory.png",
									link: "https://nationallab.assersoft.com",
								},
								{
									title: "Audiogram Management Software",
									desc: `An advanced audiogram application for seamless audiological testing, speech analysis, tympanogram assessments, and professional report generation.
									username: 5_master
									password: master12`,
									tags: [
										"React.js",
										"Daisy UI",
										"JsPDF",
										"Codeignitor",
										"MySQL",
									],
									image: "/audiogram.png",
									link: "https://audiogram.assersoft.com",
								},
							].map((p) => (
								<Card
									key={p.title}
									className="overflow-hidden flex flex-col pt-0"
								>
									<div className="relative w-full aspect-[16/10] overflow-hidden bg-muted leading-none">
										<Image
											alt={p.title}
											src={p.image || "/placeholder.svg"}
											fill
											className="object-cover block"
											sizes="100vw"
										/>
									</div>
									<CardHeader className="pb-2">
										<CardTitle className="text-lg">
											{p.title}
										</CardTitle>
										<CardDescription>
											{p.desc}
										</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex flex-wrap gap-2">
											{p.tags.map((t) => (
												<Badge
													key={t}
													variant="outline"
												>
													{t}
												</Badge>
											))}
										</div>
									</CardContent>
									<CardFooter className="mt-auto">
										<Button asChild size="sm">
											<a
												href={p.link}
												target="_blank"
												rel="noreferrer"
											>
												View project
											</a>
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* CONTACT */}
				<section
					id="contact"
					className="mx-auto max-w-6xl px-4 py-16 md:py-24"
				>
					<div className="grid gap-8 md:grid-cols-3">
						<div className="md:col-span-1">
							<h2 className="text-2xl font-semibold tracking-tight text-pretty">
								Contact
							</h2>
							<p className="mt-2 text-muted-foreground">
								Let’s build something great together
							</p>
							<div className="mt-6 space-y-2 text-sm">
								<p className="text-muted-foreground">
									Email:{" "}
									<a
										className="underline underline-offset-4"
										href="mailto:abdullah.nazir289@gmail.com"
									>
										abdullah.nazir289@gmail.com
									</a>
								</p>
								<p className="text-muted-foreground">
									Location: Remote / On‑site
								</p>
							</div>
							{/* Social Links */}
							<ul className="mt-6 space-y-1 text-sm">
								<SocialLinks />
							</ul>
						</div>
						<Card className="md:col-span-2">
							<ContactForm />
						</Card>
					</div>
				</section>
			</main>

			{/* FOOTER */}
			<footer className="border-t border-border/60">
				<div className="mx-auto max-w-6xl px-4 py-8">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<p className="text-sm text-muted-foreground">
							© {new Date().getFullYear()} Abdullah Nazir. All
							rights reserved.
						</p>
						<div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
							<nav
								aria-label="Footer"
								className="flex flex-wrap gap-2"
							>
								{[
									{ label: "Home", id: "home" as const },
									{ label: "About", id: "about" as const },
									{
										label: "Experience",
										id: "experience" as const,
									},
									{
										label: "Projects",
										id: "projects" as const,
									},
									{
										label: "Contact",
										id: "contact" as const,
									},
								].map((n) => (
									<Button
										key={n.id}
										variant="ghost"
										size="sm"
										onClick={handleNav(n.id)}
									>
										{n.label}
									</Button>
								))}
							</nav>
							<SocialLinks />
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}

function ContactForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");

	const mailto = useMemo(() => {
		const subject = encodeURIComponent(
			`Portfolio inquiry from ${name || "your website"}`,
		);
		const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
		return `mailto:abdullah.nazir289@gmail.com?subject=${subject}&body=${body}`;
	}, [name, email, message]);

	return (
		<>
			<CardHeader>
				<CardTitle>Send a message</CardTitle>
				<CardDescription>
					I’ll get back to you as soon as possible.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="grid gap-2">
					<label htmlFor="name" className="text-sm font-medium">
						Name
					</label>
					<Input
						id="name"
						placeholder="Jane Doe"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="bg-background"
					/>
				</div>
				<div className="grid gap-2">
					<label htmlFor="email" className="text-sm font-medium">
						Email
					</label>
					<Input
						id="email"
						type="email"
						placeholder="jane@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="bg-background"
					/>
				</div>
				<div className="grid gap-2">
					<label htmlFor="message" className="text-sm font-medium">
						Message
					</label>
					<Textarea
						id="message"
						placeholder="Tell me about your project, timeline, and goals..."
						rows={5}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						className="bg-background"
					/>
				</div>
			</CardContent>
			<CardFooter className="flex items-center gap-3">
				<Button asChild>
					<a href={mailto}>Send email</a>
				</Button>
				<Button variant="outline" asChild>
					<a href="#projects">Browse projects</a>
				</Button>
			</CardFooter>
		</>
	);
}

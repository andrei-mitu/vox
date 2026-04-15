import { ThemeToggleButton } from "@/components/theme/theme-toggle";

export default function LoginLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex items-center justify-center min-h-screen">
            <div className="absolute top-4 right-4">
                <ThemeToggleButton/>
            </div>
            { children }
        </div>
    );
}

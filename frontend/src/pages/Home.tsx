import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-6 text-center">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter">Barber Shop</h1>
                <p className="text-muted-foreground">Schedule your perfect cut in seconds.</p>
            </div>
            <Button size="lg" className="w-full">
                Book Appointment
            </Button>
        </div>
    );
}

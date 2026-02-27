import { AccountBodyClient } from "@/components/account/account-body-client";

export default async function AccountPage() {
    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 w-full h-full">
            <div className="mb-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Account
                </h1>
            </div>

            <AccountBodyClient />
        </div>
    );
}

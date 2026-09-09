
import { CheckIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { Address } from "../types";
import { apiDelete, apiGet, apiPatch } from "../services/api";
import toast from "react-hot-toast";

interface AddressCardProps {
    addr: Address;
    onEditHandler: (addr: Address) => void;
    setAddresses: (addresses: Address[]) => void;
}

const AddressCard = ({ addr, onEditHandler, setAddresses }: AddressCardProps) => {
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this address?')) return;
        try {
            await apiDelete(`/addresses/${id}`);
            const d = await apiGet('/addresses');
            setAddresses(d.addresses || []);
            toast.success("Address deleted");
        } catch (e: any) {
            toast.error(e.message || "Failed to delete address");
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const d = await apiPatch(`/addresses/${id}/default`, {});
            setAddresses(d.addresses || []);
            toast.success("Set as default address");
        } catch (e: any) {
            toast.error(e.message || "Failed to update default address");
        }
    };

    return (
        <div className="max-w-3xl bg-white rounded-2xl p-6 flex items-start justify-between border border-app-border hover:shadow-xs transition-shadow">
            {/* left-Address data */}
            <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-app-cream flex-center shrink-0">
                    <MapPinIcon className="size-5 text-app-green" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-app-green">{addr.label}</p>
                        {addr.isDefault ? (
                            <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-medium bg-app-green text-white rounded-full">
                                <CheckIcon className="size-2.5" />Default
                            </span>
                        ) : (
                            <button
                                onClick={() => handleSetDefault(addr._id)}
                                className="text-[10px] text-zinc-500 hover:text-app-green underline cursor-pointer"
                            >
                                Set as default
                            </button>
                        )}
                    </div>
                    {/* enter address */}
                    <p className="text-sm text-app-text-light">
                        {addr.address}, {addr.city}, {addr.state} {addr.zip}
                    </p>
                </div>
            </div>

            {/* right- Action buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onEditHandler(addr)}
                    className="p-2 text-app-text-light hover:text-app-green hover:bg-app-cream rounded-lg transition-colors"
                    title="Edit Address"
                >
                    <PencilIcon className="size-4" />
                </button>

                <button
                    onClick={() => handleDelete(addr._id)}
                    className="p-2 text-app-text-light hover:text-app-error hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Address"
                >
                    <Trash2Icon className="size-4" />
                </button>
            </div>
        </div>
    );
};

export default AddressCard;


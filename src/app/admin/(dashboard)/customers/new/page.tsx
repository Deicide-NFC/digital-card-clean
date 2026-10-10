import { CustomerForm } from "@/components/admin/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-bold">Add customer</h1>
      <p className="mb-6 mt-1 text-slate-600">
        Creating a profile also creates its permanent link and QR code.
      </p>
      <CustomerForm mode="create" />
    </div>
  );
}

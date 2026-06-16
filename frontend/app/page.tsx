import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard/companies/demo-company/vendors');
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';


export default function Index({ jobs }) {


    function deleteJob(id) {

        if (confirm('Sigur dorești ștergerea acestei lucrări?')) {

            router.delete(route('jobs.destroy', id));

        }

    }



    return (

        <AuthenticatedLayout>

            <Head title="Lucrări" />


            <div className="p-6">


                <div className="flex justify-between items-center mb-6">


                    <h1 className="text-2xl font-bold">
                        Lucrări
                    </h1>


                    <Link

                        href={route('jobs.create')}

                        className="px-4 py-2 bg-blue-600 text-white rounded"

                    >

                        + Lucrare nouă

                    </Link>


                </div>



                <div className="bg-white rounded shadow overflow-hidden">


                    <table className="w-full">


                        <thead>

                            <tr className="border-b bg-gray-100">


                                <th className="p-3 text-left">
                                    Nr.
                                </th>


                                <th className="p-3 text-left">
                                    Client
                                </th>


                                <th className="p-3 text-left">
                                    Tip lucrare
                                </th>


                                <th className="p-3 text-left">
                                    Data
                                </th>


                                <th className="p-3 text-left">
                                    Status
                                </th>


                                <th className="p-3 text-center">
                                    Acțiuni
                                </th>


                            </tr>

                        </thead>



                        <tbody>


                        {jobs.length === 0 && (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="p-5 text-center"
                                >
                                    Nu există lucrări
                                </td>

                            </tr>

                        )}




                        {jobs.map(job => (


                            <tr
                                key={job.id}
                                className="border-b"
                            >


                                <td className="p-3">
                                    {job.number}
                                </td>


                                <td className="p-3">
                                    {job.client?.name}
                                </td>


                                <td className="p-3">
                                    {job.type}
                                </td>


                                <td className="p-3">
                                    {job.scheduled_date}
                                </td>


                                <td className="p-3">
                                    {job.status}
                                </td>


                                <td className="p-3 text-center">


                                    <Link

                                        href={route(
                                            'jobs.edit',
                                            job.id
                                        )}

                                        className="px-3 py-1 bg-yellow-500 text-white rounded mr-2"

                                    >

                                        Editare

                                    </Link>



                                    <button

                                        onClick={() =>
                                            deleteJob(job.id)
                                        }

                                        className="px-3 py-1 bg-red-600 text-white rounded"

                                    >

                                        Șterge

                                    </button>


                                </td>


                            </tr>


                        ))}


                        </tbody>


                    </table>


                </div>


            </div>


        </AuthenticatedLayout>

    );

}
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';


export default function Index({ customers }) {


    const [search, setSearch] = useState('');



    const deleteCustomer = (id) => {

        if (confirm('Sigur doriți să ștergeți acest client?')) {

            router.delete(route('customers.destroy', id));

        }

    };



    const filteredCustomers = customers.data.filter((customer) => {


        const text = search.toLowerCase();



        return (

            customer.company_name?.toLowerCase().includes(text) ||

            customer.contact_name?.toLowerCase().includes(text) ||

            customer.phone?.toLowerCase().includes(text) ||

            customer.email?.toLowerCase().includes(text) ||

            customer.cui?.toLowerCase().includes(text)

        );


    });



    return (

        <AuthenticatedLayout

            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Clienți
                </h2>
            }

        >


            <Head title="Clienți" />



            <div className="py-12">


                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">


                    <div className="bg-white shadow-sm rounded-lg p-6">



                        <div className="flex justify-between mb-6">


                            <h3 className="text-lg font-semibold">
                                Lista clienților
                            </h3>



                            <Link

                                href={route('customers.create')}

                                className="bg-blue-600 text-white px-4 py-2 rounded"

                            >

                                + Client nou

                            </Link>


                        </div>




                        <input

                            className="w-full border rounded p-2 mb-5"

                            placeholder="Caută client..."

                            value={search}

                            onChange={(e)=>setSearch(e.target.value)}

                        />




                        <table className="w-full border">


                            <thead>


                                <tr className="bg-gray-100">


                                    <th className="border p-3">
                                        Client
                                    </th>


                                    <th className="border p-3">
                                        Contact
                                    </th>


                                    <th className="border p-3">
                                        Telefon
                                    </th>


                                    <th className="border p-3">
                                        CUI
                                    </th>


                                    <th className="border p-3">
                                        Tip
                                    </th>


                                    <th className="border p-3">
                                        Acțiuni
                                    </th>


                                </tr>


                            </thead>




                            <tbody>



                            {filteredCustomers.map((customer)=>(


                                <tr key={customer.id}>


                                    <td className="border p-3">

                                        {customer.company_name}

                                    </td>



                                    <td className="border p-3">

                                        {customer.contact_name}

                                    </td>



                                    <td className="border p-3">

                                        {customer.phone}

                                    </td>



                                    <td className="border p-3">

                                        {customer.cui}

                                    </td>



                                    <td className="border p-3">

                                        {customer.type}

                                    </td>




                                    <td className="border p-3 text-center">


                                        <Link

                                            href={route('customers.edit', customer.id)}

                                            className="text-blue-600 mr-4"

                                        >

                                            Editare

                                        </Link>




                                        <button

                                            onClick={()=>deleteCustomer(customer.id)}

                                            className="text-red-600"

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


            </div>


        </AuthenticatedLayout>

    );

}
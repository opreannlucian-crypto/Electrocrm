import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';


export default function Create() {


    const { data, setData, post, processing, errors } = useForm({

        company_name: '',
        contact_name: '',
        cui: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        county: '',
        type: 'Persoană juridică',
        notes: '',

    });



    const submit = (e) => {

        e.preventDefault();

        post(route('customers.store'));

    };



    return (

        <AuthenticatedLayout

            header={
                <h2 className="font-semibold text-xl text-gray-800">
                    Client nou
                </h2>
            }

        >

            <Head title="Client nou" />


            <div className="py-12">

                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">

                    <div className="bg-white shadow-sm rounded-lg p-6">


                        <form onSubmit={submit} className="space-y-5">


                            <div>
                                <label>Firmă / Client</label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={data.company_name}
                                    onChange={e => setData('company_name', e.target.value)}
                                />
                            </div>



                            <div>
                                <label>Persoană contact</label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={data.contact_name}
                                    onChange={e => setData('contact_name', e.target.value)}
                                />
                            </div>



                            <div>
                                <label>CUI</label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={data.cui}
                                    onChange={e => setData('cui', e.target.value)}
                                />
                            </div>



                            <div>
                                <label>Telefon</label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                />
                            </div>



                            <div>
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="w-full border rounded p-2"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                />
                            </div>



                            <div>
                                <label>Adresă</label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                />
                            </div>



                            <div>
                                <label>Localitate</label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                />
                            </div>



                            <div>
                                <label>Județ</label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={data.county}
                                    onChange={e => setData('county', e.target.value)}
                                />
                            </div>



                            <div>

                                <label>Tip client</label>

                                <select

                                    className="w-full border rounded p-2"

                                    value={data.type}

                                    onChange={e => setData('type', e.target.value)}

                                >

                                    <option>
                                        Persoană juridică
                                    </option>

                                    <option>
                                        Persoană fizică
                                    </option>

                                </select>

                            </div>



                            <div>
                                <label>Observații</label>

                                <textarea
                                    className="w-full border rounded p-2"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                />

                            </div>



                            <button

                                disabled={processing}

                                className="bg-blue-600 text-white px-6 py-2 rounded"

                            >

                                Salvează client

                            </button>


                        </form>


                    </div>

                </div>

            </div>


        </AuthenticatedLayout>

    );

}
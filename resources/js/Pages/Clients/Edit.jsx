import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';


export default function Edit({ client }) {


    const { data, setData, put, processing, errors } = useForm({

        type: client.type || 'firma',
        name: client.name || '',
        cui: client.cui || '',
        contact_person: client.contact_person || '',
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        city: client.city || '',
        notes: client.notes || '',

    });



    function submit(e) {

        e.preventDefault();

        put(route('clients.update', client.id));

    }



    return (

        <AuthenticatedLayout>


            <Head title="Editare client" />


            <div className="p-6">


                <h1 className="text-2xl font-bold mb-6">
                    Editare client
                </h1>



                <form
                    onSubmit={submit}
                    className="space-y-4 max-w-xl"
                >



                    <input

                        className="border p-2 w-full"

                        placeholder="Nume client / Firmă"

                        value={data.name}

                        onChange={e =>
                            setData('name', e.target.value)
                        }

                    />

                    {errors.name && (
                        <div className="text-red-600">
                            {errors.name}
                        </div>
                    )}




                    <input

                        className="border p-2 w-full"

                        placeholder="CUI"

                        value={data.cui}

                        onChange={e =>
                            setData('cui', e.target.value)
                        }

                    />




                    <input

                        className="border p-2 w-full"

                        placeholder="Persoană contact"

                        value={data.contact_person}

                        onChange={e =>
                            setData(
                                'contact_person',
                                e.target.value
                            )
                        }

                    />




                    <input

                        className="border p-2 w-full"

                        placeholder="Telefon"

                        value={data.phone}

                        onChange={e =>
                            setData('phone', e.target.value)
                        }

                    />




                    <input

                        className="border p-2 w-full"

                        placeholder="Email"

                        value={data.email}

                        onChange={e =>
                            setData('email', e.target.value)
                        }

                    />




                    <input

                        className="border p-2 w-full"

                        placeholder="Oraș"

                        value={data.city}

                        onChange={e =>
                            setData('city', e.target.value)
                        }

                    />




                    <textarea

                        className="border p-2 w-full"

                        placeholder="Adresă"

                        value={data.address}

                        onChange={e =>
                            setData('address', e.target.value)
                        }

                    />




                    <textarea

                        className="border p-2 w-full"

                        placeholder="Observații"

                        value={data.notes}

                        onChange={e =>
                            setData('notes', e.target.value)
                        }

                    />




                    <button

                        disabled={processing}

                        className="px-5 py-2 bg-green-600 text-white rounded"

                    >

                        Salvează modificările

                    </button>



                </form>


            </div>


        </AuthenticatedLayout>

    );

}
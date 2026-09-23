import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';


export default function Create({ clients, job = null }) {


    const { data, setData, post, put, processing, errors } = useForm({

        client_id: job?.client_id ?? '',
        type: job?.type ?? 'Supraveghere video',
        address: job?.address ?? '',
        contact_person: job?.contact_person ?? '',
        phone: job?.phone ?? '',
        scheduled_date: job?.scheduled_date ?? '',
        scheduled_time: job?.scheduled_time ?? '',
        status: job?.status ?? 'noua',
        description: job?.description ?? '',
        materials: job?.materials ?? '',
        notes: job?.notes ?? '',

    });



    function submit(e) {

        e.preventDefault();

        if (job) {
            put(route('jobs.update', job.id));
            return;
        }

        post(route('jobs.store'));

    }



    return (

        <AuthenticatedLayout>


            <Head title="Lucrare nouă" />


            <div className="p-6">


                <h1 className="text-2xl font-bold mb-6">
                    {job ? 'Editează lucrarea' : 'Lucrare nouă'}
                </h1>



                <form
                    onSubmit={submit}
                    className="space-y-4 max-w-2xl"
                >


                    <select

                        className="border p-2 w-full"

                        value={data.client_id}

                        onChange={e =>
                            setData(
                                'client_id',
                                e.target.value
                            )
                        }

                    >

                        <option value="">
                            Selectează client
                        </option>


                        {clients.map(client => (

                            <option
                                key={client.id}
                                value={client.id}
                            >
                                {client.name}
                            </option>

                        ))}


                    </select>



                    <select

                        className="border p-2 w-full"

                        value={data.type}

                        onChange={e =>
                            setData(
                                'type',
                                e.target.value
                            )
                        }

                    >

                        <option>
                            Supraveghere video
                        </option>

                        <option>
                            Sistem alarmare
                        </option>

                        <option>
                            Control acces
                        </option>

                        <option>
                            Automatizare poartă
                        </option>

                        <option>
                            Cablare date
                        </option>

                        <option>
                            Mentenanță
                        </option>

                    </select>




                    <input

                        className="border p-2 w-full"

                        placeholder="Adresă intervenție"

                        value={data.address}

                        onChange={e =>
                            setData(
                                'address',
                                e.target.value
                            )
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
                            setData(
                                'phone',
                                e.target.value
                            )
                        }

                    />




                    <div className="flex gap-3">


                        <input

                            type="date"

                            className="border p-2 w-full"

                            value={data.scheduled_date}

                            onChange={e =>
                                setData(
                                    'scheduled_date',
                                    e.target.value
                                )
                            }

                        />



                        <input

                            type="time"

                            className="border p-2 w-full"

                            value={data.scheduled_time}

                            onChange={e =>
                                setData(
                                    'scheduled_time',
                                    e.target.value
                                )
                            }

                        />


                    </div>





                    <select

                        className="border p-2 w-full"

                        value={data.status}

                        onChange={e =>
                            setData(
                                'status',
                                e.target.value
                            )
                        }

                    >

                        <option value="noua">
                            Nouă
                        </option>

                        <option value="programata">
                            Programată
                        </option>

                        <option value="lucru">
                            În lucru
                        </option>

                        <option value="finalizata">
                            Finalizată
                        </option>

                        <option value="facturata">
                            Facturată
                        </option>


                    </select>





                    <textarea

                        className="border p-2 w-full"

                        placeholder="Descriere problemă / lucrare"

                        value={data.description}

                        onChange={e =>
                            setData(
                                'description',
                                e.target.value
                            )
                        }

                    />




                    <textarea

                        className="border p-2 w-full"

                        placeholder="Materiale folosite"

                        value={data.materials}

                        onChange={e =>
                            setData(
                                'materials',
                                e.target.value
                            )
                        }

                    />




                    <textarea

                        className="border p-2 w-full"

                        placeholder="Observații"

                        value={data.notes}

                        onChange={e =>
                            setData(
                                'notes',
                                e.target.value
                            )
                        }

                    />





                    <button

                        disabled={processing}

                        className="px-5 py-2 bg-green-600 text-white rounded"

                    >

                        Salvează lucrare

                    </button>



                </form>


            </div>


        </AuthenticatedLayout>

    );

}

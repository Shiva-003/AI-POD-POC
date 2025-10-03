import { HiOutlineDocumentSearch } from "react-icons/hi";

const EmptyState = () => {
    return <div>
        <div className="h-80 bg-card-light/50 backdrop-blur-md rounded-xl p-8 shadow-2xl shadow-slate-900/10 flex flex-col justify-center items-center text-muted-light">
            <HiOutlineDocumentSearch size={48} className="mb-4 " />
            <h1 className="text-2xl mb-2">
                No diagnoses yet
            </h1>
            <p>
                Start by uploading a medical image to receive your first AI-based diagnosis.
            </p>
        </div>
    </div>
}

export default EmptyState;
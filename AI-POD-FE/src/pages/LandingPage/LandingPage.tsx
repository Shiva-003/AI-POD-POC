import Login from "../../components/Login/Login";

const LandingPage = () => {
    return (
        <div className="h-full grid md:grid-cols-2 gap-12 items-center  py-16 md:py-24">
            <div className="flex flex-col justify-center">
                <h1 className="text-5xl font-bold mb-6">Welcome to MediBuddy</h1>
                <p className="text-muted-light mb-4">Revolutionizing medical diagnosis with the power of artificial intelligence. Our platform provides instant analysis for skin, wound, and eye diseases.</p>
                <p className="text-muted-light">Built on cutting-edge technology, MediBuddy assists healthcare professionals in making faster, more accurate diagnoses. Simply upload an image and let our AI do the rest.</p>
            </div>
            <div className="flex items-center justify-center">
                <Login />
            </div>
        </div>
    );
};

export default LandingPage;

const LocationMap = ({ img }) => (
    <div className="bg-[#1e293b] shadow-lg h-full relative overflow-hidden">
        <img
            src={img}
            alt="World Map"
            // The image itself doesn't need rounded corners anymore.
            className="w-full h-full object-cover"
        />
        {/* This overlay now correctly sits on top of the image inside the container. */}
        <div
            className="absolute inset-0"
            style={{
                background: `radial-gradient(ellipse at center, transparent 60%, rgba(30,41,59, 0.8) 90%, rgba(30,41,59, 1) 100%)`
            }}
        ></div>
    </div>
);

export default LocationMap;

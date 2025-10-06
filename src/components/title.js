function Title() {
    const handleChatInspectorClick = () => {
        window.open('http://localhost:6274', '_blank');
    };

    return <section className="mx-auto sm:container py-[10px]" style={{
        // backgroundColor: "#f6f6f6",
        borderRadius: "10px"
    }}>
        <div className="mx-auto sm:container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ marginRight: "10px" }}>
                        <img src={process.env.PUBLIC_URL + "/logo.png"} width={60} alt="一体机硬件设备平台" />
                    </div>
                    <div>
                        <h1
                            className="mb-1 text-2xl font-semibold text-white">
                            济南工匠学院一体机硬件设备平台
                        </h1>
                        <p className="text-sm font-medium text-white">
                            专注AI教学硬件设备教育
                        </p>
                    </div>
                </div>
                {/* <div>
                    <button
                        onClick={handleChatInspectorClick}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                        style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            border: "none",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}
                    >
                        AI对话控制
                    </button>
                </div> */}
            </div>
        </div>
    </section>
}

export default Title
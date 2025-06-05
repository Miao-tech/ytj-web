function Title() {
    return <section className="mx-auto sm:container py-[10px]" style={{
        // backgroundColor: "#f6f6f6",
        borderRadius: "10px"
    }}>
        <div className="mx-auto sm:container">
            <div style={{ display: "flex", alignContent: "center" }}>
                <div style={{ marginRight: "10px" }}>
                    <img src={process.env.PUBLIC_URL + "/logo.png"} width={60} alt="一体机硬件设备平台" />
                </div>
                <div>
                    <h1
                        className="mb-1 text-2xl font-semibold"
                        style={{
                            background: "-webkit-linear-gradient(top, rgb(0 0 0), rgb(255 16 16)) text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                        图克一体机硬件设备平台
                    </h1>
                    <p className="text-sm font-medium text-body-color" style={{ color: "#7f7f7f" }}>
                        专注AI教学硬件设备教育
                    </p>
                </div>
            </div>
        </div>
    </section>
}

export default Title
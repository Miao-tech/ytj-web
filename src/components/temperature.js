import React, { useState } from 'react'
import { useSelector } from 'react-redux'

function Temperature() {
    const temperature = useSelector((state) => state.integratedMachine.temperature)
    const humidity = useSelector((state) => state.integratedMachine.humidity)


    return (
        <div className="mx-auto px-4 sm:container py-10 mt-[10px]" style={{
            backgroundColor: "#f6f6f6",
            borderRadius: "10px"
        }}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8" >
                <dl className="grid grid-cols-1 gap-x-8 gap-y-24 text-center lg:grid-cols-2">
                    <div className="mx-auto flex max-w-xs flex-col">
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">温度: {temperature}℃</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col">
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">湿度: {humidity}%</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}

export default Temperature;

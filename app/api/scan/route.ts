import { NextResponse } from "next/server"
import os from "os"
import net from "net"

function checkPort(host: string, port: number, timeoutMs = 500): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket()

        // If the socket connects successfully, port is open
        socket.on('connect', () => {
            socket.destroy()
            resolve(true)
        })

        // If there is an error (e.g., connection refused), port is closed
        socket.on('error', () => {
            socket.destroy()
            resolve(false)
        })

        // If it times out, assume port is closed
        socket.setTimeout(timeoutMs)
        socket.on('timeout', () => {
            socket.destroy()
            resolve(false)
        })

        // Initiate connection
        socket.connect(port, host)
    })
}

function getLocalSubnets(): string[] {
    const interfaces = os.networkInterfaces()
    const subnets: string[] = []

    for (const name of Object.keys(interfaces)) {
        const ifaceArray = interfaces[name]
        if (!ifaceArray) continue

        for (const iface of ifaceArray) {
            // Only care about IPv4 and non-internal (non-loopback) addresses
            if (iface.family === "IPv4" && !iface.internal) {
                subnets.push(iface.address)
            }
        }
    }

    return subnets
}

function getIpsInSubnet(ipAddress: string): string[] {
    // Very simple implementation assuming a standard /24 subnet mask for local networks
    // e.g., 192.168.1.5 -> checks 192.168.1.1 to 192.168.1.254
    const parts = ipAddress.split('.')
    if (parts.length !== 4) return []

    const baseIp = `${parts[0]}.${parts[1]}.${parts[2]}`
    const ips: string[] = []

    for (let i = 1; i < 255; i++) {
        ips.push(`${baseIp}.${i}`)
    }

    // Also include localhost for dev convenience
    ips.push("127.0.0.1")

    return ips
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const serverUrl = searchParams.get("serverUrl")

    if (serverUrl?.startsWith("demo://")) {
        return NextResponse.json({ error: "Network scanning is disabled in demo mode" }, { status: 403 })
    }

    try {
        const subnets = getLocalSubnets()
        const allIpsToScan = new Set<string>()
        allIpsToScan.add("127.0.0.1")

        for (const subnetIp of subnets) {
            const ips = getIpsInSubnet(subnetIp)
            for (const ip of ips) {
                allIpsToScan.add(ip)
            }
        }

        const TARGET_PORT = 3923
        const foundIps: string[] = []

        // We can scan IPs in parallel to speed this up significantly
        // However, Node.js net limit could be an issue if we spawn 255*N connections at once
        // So we chunk them
        const ipArray = Array.from(allIpsToScan)
        const chunkSize = 50

        for (let i = 0; i < ipArray.length; i += chunkSize) {
            const chunk = ipArray.slice(i, i + chunkSize)
            const checks = chunk.map(async (ip) => {
                const isOpen = await checkPort(ip, TARGET_PORT, 200) // fast 200ms timeout
                if (isOpen) {
                    foundIps.push(ip)
                }
            })

            await Promise.all(checks)
        }

        // De-duplicate if needed
        const uniqueFoundIps = Array.from(new Set(foundIps))

        return NextResponse.json({ targets: uniqueFoundIps })
    } catch (error) {
        console.error("Scan error:", error)
        return NextResponse.json({ error: "Failed to scan networks" }, { status: 500 })
    }
}

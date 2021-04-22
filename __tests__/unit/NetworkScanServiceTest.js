import NetworkScanService from '../../services/NetworkScanService';

it('returns devices IP address correctly', async () => {
    await expect(NetworkScanService.getIp()).resolves.toEqual("192.168.100.57");
});

it('returns devices subnet mask correctly', async () => {
    await expect(NetworkScanService.getSubnet()).resolves.toEqual("255.255.255.0");
});

it('compares two IP addresses according to heuristic correctly', () => {
    expect(NetworkScanService.ipComparator("192.168.100.50", "192.168.100.68", 68)).toBeGreaterThan(0);
});

it('returns available IP addresses in subnet correctly', async () => {
    const availableIPs = await NetworkScanService.getAvailableIps(68);
    expect(availableIPs.length).toEqual(254);
    expect(availableIPs.includes("192.168.100.1")).toEqual(true);
    expect(availableIPs.includes("192.168.0.57")).toEqual(false);
});

it('auto scan scans subnet correctly', async () => {
    const fn = jest.fn();
    await NetworkScanService.autoScan(fn, "502", 68);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith({ name: "Device #1", ip: "192.168.100.68" });
});
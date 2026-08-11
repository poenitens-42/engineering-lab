window.PORTFOLIO_PROJECTS = [
  {
    repo: "hft_project",
    title: "hft_project",
    category: "software",
    status: "Live",
    stack: "C · XDP/eBPF",
    summary:
      "XDP/eBPF feed handler in SKB mode for market-data style packet processing and low-level systems exploration.",
    detailLabel: "Focus",
    detail: "Kernel networking, packet flow, latency",
    fallbackUpdated: "July 4, 2026",
    url: "https://github.com/poenitens-42/hft_project",
    log: [
      // { date: "2026-07-04", title: "SKB mode feed handler", body: "What you did that day, in your own words." },
    ]
  },
  {
    repo: "cpp-hft-project",
    title: "cpp-hft-project",
    category: "software",
    status: "Prototype",
    stack: "C++20 · ASIO",
    summary:
      "Limit order book engine with async TCP server, coroutine networking, RDTSC benchmarking, and O(1) price-level indexing.",
    detailLabel: "Result",
    detail: "Loopback RTT p50 around 21 microseconds",
    fallbackUpdated: "August 11, 2026",
    url: "https://github.com/poenitens-42/cpp-hft-project",
    log: [
      {
        date: "2026-08-05",
        title: "Found the benchmark was measuring the wrong thing",
        body:
          "bench_client only ever sent ADD messages. With ORDERS_PER_LEVEL capped at 8 and no way to free a slot, every price level saturated within ~5,000 messages — so ~97% of a 100k-message run was hitting the 'level full, reject' path, not real insert/cancel/rescan work. p50/p99 numbers up to this point were measuring rejection-loop cost, not the order book. Added a CANCEL message type to the wire protocol (OrderMsg now carries a type byte) and rewrote bench_client to track server-confirmed resting orders and cancel against them, oscillating book depth in a stable ~150-300/side band via a force-add/force-cancel rule. This keeps rescan_best() and the FIFO/wraparound logic actually exercised."
      },
      {
        date: "2026-08-08",
        title: "Split RTT into network vs. LOB processing time",
        body:
          "AckMsg now carries a t1/t2 RDTSC pair the server takes right before/after the add_order()/cancel_order() call, so the client can separate full round-trip latency into processing_ns (LOB-only) and network_ns (TCP + kernel scheduling) — valid since client and server share a CPU with constant_tsc verified. Re-ran the 100k-sample realistic add/cancel benchmark on this basis: RTT p50 ~16.1us / p99 ~22.8us, but LOB processing alone is p50 ~50ns / p99 ~280ns. The order book itself isn't the bottleneck — loopback TCP/kernel overhead is ~16.3us of the ~16.4us median RTT. That's the number kernel bypass (DPDK/RDMA) would actually be targeting."
      },
      {
        date: "2026-08-10",
        title: "OS tuning: isolation helped the tail, not the median",
        body:
          "Tested standard low-latency tuning (isolcpus/nohz_full/rcu_nocbs, taskset pinning, performance governor, THP=madvise, swap off) against the benchmark instead of assuming it'd help. Result: full isolation traded median latency for tail predictability — mean RTT went from 16.36us (untuned) to 22.64us, but max dropped from 88.27us to 52.25us. Isolation alone (no nohz_full/rcu_nocbs) got max down to 44.50us. Likely cause: nohz_full's tick-suspension only pays off with sustained uninterrupted userspace runs, and this workload blocks on write()/read_some() every ~16-20us, so it probably pays the bookkeeping cost without the benefit. Also caught and fixed a bad isolcpus=6,7 config that used two SMT sibling threads of the same physical core instead of independent cores (confirmed via lscpu -e) — that regressed to 139.99us max from L1/L2/front-end contention."
      },
      {
        date: "2026-08-11",
        title: "kdb+/q C API integration complete",
        body:
          "Added KdbClient (include/analytics + src/analytics) as a thin RAII wrapper around kdb+'s C API (k.h), isolated to a single translation unit so the rest of the codebase never touches k.h directly — just connect()/execute()/disconnect(). Handled the const-correctness mismatch (khpu/k take non-const S) with const_cast per KX's documented pattern. Fully decoupled from hft_app, so the core server/LOB/benchmark build and run with zero dependency on kdb+ being present. Also fixed kdb_test, which was previously mis-configured to share a main() with hft_app — now a separate executable that needs a live q process on localhost:5001 and fails cleanly with 'Failed to connect to q' when there isn't one."
      }
    ]
  },
  {
    repo: "Quantum-Error-Mitigation",
    title: "Quantum Error Mitigation",
    category: "research",
    status: "Study",
    stack: "Python · ML",
    summary:
      "ML-driven adaptive mitigation for NISQ circuits, selecting between Linear ZNE and Richardson ZNE by circuit and noise regime.",
    detailLabel: "Result",
    detail: "64.3% selector accuracy, +11.9pp over baseline",
    fallbackUpdated: "July 1, 2026",
    url: "https://github.com/poenitens-42/Quantum-Error-Mitigation",
    log: []
  },
  {
    repo: "Alternate-Alpha-Generator",
    title: "Alternate Alpha Generator",
    category: "hardware",
    status: "Live",
    stack: "Python · alternative data",
    summary:
      "Three-signal alpha system using Reddit/FinBERT sentiment, news flow, and Sentinel-2 satellite imagery with IC/ICIR evaluation.",
    detailLabel: "Best result",
    detail: "PLTR IC(1d)=+0.352, p<0.01",
    fallbackUpdated: "June 29, 2026",
    url: "https://github.com/poenitens-42/Alternate-Alpha-Generator",
    log: []
  },
  {
    repo: "Xensense_v1",
    title: "Xensense_v1",
    category: "research",
    status: "Prototype",
    stack: "Python · computer vision",
    summary:
      "Video object segmentation and labeling prototype aimed at automation workflows in cars.",
    detailLabel: "Focus",
    detail: "Segmentation, labeling, visual automation",
    fallbackUpdated: "June 3, 2026",
    url: "https://github.com/poenitens-42/Xensense_v1",
    log: []
  },
  {
    repo: "no-gil-execution-simulator",
    title: "no-gil simulator",
    category: "software",
    status: "Study",
    stack: "Python runtime",
    summary:
      "Execution simulator for thinking through Python no-GIL behavior, concurrency, and interpreter-level performance questions.",
    detailLabel: "Focus",
    detail: "Runtime behavior, concurrency, simulation",
    fallbackUpdated: "June 2, 2026",
    url: "https://github.com/poenitens-42/no-gil-execution-simulator",
    log: []
  }
];

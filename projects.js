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
    fallbackUpdated: "August 11, 2026",
    url: "https://github.com/poenitens-42/hft_project",
    log: [
      {
        date: "2026-08-11",
        title: "Where this stands: XDP feed path working, order book in progress",
        body:
          "Pipeline is Exchange Simulator (UDP, port 9000) -> XDP Feed Handler (kernel-space, attaches at the NIC driver level via an XDP hook) -> userspace C++ feed loader -> lock-free order book -> strategy layer. The XDP handler parses Ethernet/IP/UDP down to the market message, filters by feed port, timestamps with the kernel nanosecond clock, and pushes parsed messages to userspace over a zero-copy lock-free ring buffer -- the kernel network stack never touches feed packets. The userspace loader consumes from that ring buffer and measures kernel-to-userspace latency per message. The lock-free order book (L2/L3, cache-aligned price levels, no dynamic allocation in the hot path, benchmarked with rdtsc) is still in progress, and the strategy layer is planned but not started. Built against Linux 6.14 XDP/eBPF, libbpf, Clang 18 for the BPF program and GCC 13 for userspace, on the same Ryzen 7 7730U box as cpp-hft-project, using a commodity WiFi NIC."
      }
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
    fallbackUpdated: "August 18, 2026",
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
      },
      {
        date: "2026-08-18",
        title: "ITCH 5.0 parser (itch_stats) parses a full real NASDAQ feed cleanly",
        body:
          "Built itch_stats to parse real ITCH 5.0 market data instead of the synthetic exchange simulator feed, as a step toward feeding the order book from actual exchange data. Ran it against a real 3.28GB NASDAQ BX ITCH file (S030220-v50-bx.txt): 109,386,091 messages parsed, 3,280,036,325 / 3,280,036,325 bytes consumed (full file, no leftover bytes), parse ended cleanly. Message type histogram breaks down as Add (A: 41.17M), Delete (D: 40.27M), Order Executed/Modified (U: 15.05M), Non-Displayed Add (N: 9.94M), Executed (E: 1.29M), Cancel (X: 1.14M), Trade (P: 384K), and smaller counts for F/Y/H/R/C/L/S/V message types. Stock Directory ('R') messages identified 8,909 distinct symbols. No bugs or surprises hit getting to this clean full-consumption parse on the first real run — a contrast to the earlier bench_client issue where a parsing/measurement bug wasn't caught until digging into the numbers."
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
    fallbackUpdated: "August 11, 2026",
    url: "https://github.com/poenitens-42/Alternate-Alpha-Generator",
    log: [
      {
        date: "2026-08-11",
        title: "Where this stands: three signal pipelines, 90-day backtest results in",
        body:
          "Three alternative-data alpha pipelines built to institutional quant standards (rolling z-score normalization, lag shift T -> T+1 to avoid look-ahead bias, IC/ICIR/t-test evaluation): Reddit sentiment (WSB + r/stocks via PRAW, FinBERT scoring, daily aggregation), Finnhub news sentiment (weekly-chunked fetcher to get around the 250-article API cap, FinBERT on headlines + summaries), and satellite imagery (Sentinel-2 via Google Earth Engine, dark-pixel parking-lot occupancy as a retail foot-traffic proxy for WMT/TGT/HD). On the Finnhub news pipeline, 90-day backtest across 15 tickers: PLTR IC(1d)=+0.352 (p<0.01, 64.3% hit rate) is the standout, with GME +0.215 (p<0.05), NVDA +0.168 and MSFT +0.167 (both p<0.10) also showing signal; TSLA came back negative at -0.183. Portfolio ICIR across the positive-IC tickers is roughly 0.8. Satellite occupancy (180-day, WMT/TGT/HD) is weaker and noisier -- TGT +0.379 at 1-day lag is the one borderline-significant result (p~=0.03), HD and WMT don't show a clean signal yet. Known limitations going in: 90 days is a short sample for IC significance (want n>=100 for real confidence), no transaction costs modeled yet, and the satellite feed's 5-day Sentinel-2 revisit cycle makes that signal inherently sparse."
      }
    ]
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

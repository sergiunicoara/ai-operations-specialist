# Chart walkthrough (≈60 s) and optional live demo (≈60 s)

Use on the chart slide (team slide 2 / standalone slide 5). Point as you speak.

## Walkthrough

1. **Axes first.** "Grams of NOx per kilometre, linear scale from zero. Each group is one test condition."
2. **The red dashed line.** "0.043: the Tier 2 Bin 5 certification standard. A reference, not a road test."
3. **Left group.** "The study's own lab tests: 0.022 for A, 0.016 for B, both under the line. C was never lab-tested, so no bar."
4. **Blue bars climb.** "Same car A on the road: 0.61 on the highway, 1.5 on the rural hills, 35 times the standard."
5. **Orange stays high everywhere.** "B: between 8 and 19 times the standard on every route."
6. **Green is the contrast.** "C sits near the line except on the hills, where it reaches about 9.5 times. A different car; context, not a controlled experiment."
7. **Honesty markers.** "Thin bars are the published standard deviations. Missing bars mean no test, not zero."
8. **Hand-off.** "The data proves a gap. It doesn't prove why. That took the EPA and VW's own admissions."

## Optional live demo: "the denominator changes the headline"

```bash
python presentation/demo_denominators.py
```

It prints every route mean divided by the standard and by the car's own lab mean. Say: "Same
measurement, 1.505 g/km. Divide by the standard: 35 times. Divide by the car's lab result: about
68 times. And the plea agreement's 'about 40 times' is a single run, 1.72 g/km. Every headline
number needs its denominator." Caveat to add: the lab mean comes from two tests (± 0.006), so 68
is an order of magnitude.

To show the chart is reproducible, run `python chart/make_charts.py` (static PNG) or
`npm run build` in `presentation/` (native, editable PowerPoint chart), both from `data/nox_data.csv`.

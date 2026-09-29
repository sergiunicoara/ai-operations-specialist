# Expanded script — 8–10 minutes, for presenting this section alone

Use this version if you end up covering the whole VW case solo. It keeps the
same three slides but adds the background and legal outcome context a second
speaker would otherwise have covered. Pace: ~130 words/minute.

---

### [0:00–1:15] Cold open + background

"In September 2015, the EPA accused one of the largest carmakers in the world
of cheating on emissions tests. By 2017, Volkswagen had pleaded guilty to
federal crimes and agreed to pay $4.3 billion in criminal and civil penalties
— $2.8 billion of that a criminal fine, the rest civil settlements with the
EPA and U.S. Customs. Six VW executives were indicted. This is now widely
known as 'Dieselgate.'

I'm going to walk through the part of this story that doesn't get told as
often: how anyone found out in the first place. It wasn't a whistleblower
inside VW, and it wasn't regulators running an undercover sting. It was a
university research group doing a routine measurement study — and getting a
result that didn't make sense."

### [1:15–2:30] Slide 1 — The study

"[Advance to Slide 1.] In 2014, West Virginia University's engine and
emissions research center was hired by the International Council on Clean
Transportation — the ICCT, a nonprofit — to test how clean 'clean diesel' cars
actually were in everyday use. This was not an investigation. ICCT's actual
goal was to build a case *for* diesel as a low-emissions option in the U.S.
market, using real-world data to support it.

They picked three diesel passenger cars, each certified to the same U.S. and
California emissions standards but built with different NOx after-treatment
technology — one uses something called a lean-NOx trap, two use urea-based
selective catalytic reduction, which most people know as the 'AdBlue' system.
They fitted each car with a portable emissions measurement system — a PEMS —
essentially a shrunk-down version of the same lab equipment used for official
certification, mounted directly to the tailpipe, so it measures actual
pollutant output continuously while the car is being driven normally. Then
they drove all three cars over five different real routes around California —
highway, city driving in LA and San Diego, and a hilly rural route — and, for
two of the three cars, also ran them through the official lab certification
cycle so they'd have a same-car comparison."

### [2:30–4:30] Slide 2 — The chart

"[Advance to Slide 2.] Here's what they found, and this is the chart I want
you to remember. The y-axis is NOx — nitrogen oxides, the pollutant behind a
lot of urban smog and linked to respiratory disease — in grams per kilometer.
This dashed red line is the legal limit under the EPA's Tier 2 Bin 5 standard:
0.043 grams per kilometer, measured over the vehicle's full useful life.

Start on the left: the lab certification result. Both tested cars pass
comfortably — 0.022 and 0.016 grams per kilometer, both well under the line.
If you only ever looked at the certification paperwork, these cars look
clean.

Now look at the road results, same cars, five different real routes. The blue
bars — that's the lean-NOx-trap vehicle — range from about 14 times the legal
limit on the highway up to 35 times on the rural hill route. The orange bars —
the first urea-SCR vehicle — range from roughly 8 times up to about 19 times,
depending on the route. The report's own executive summary rounds these to
'15 to 35 times' and '5 to 20 times' respectively, and I want to be precise
about what that means: those are how far *that vehicle, on that route*
exceeded the *legal standard* — not a ratio between the lab number and the
road number. Different comparison, same alarming conclusion.

And then there's the green bars — a third vehicle, using a different
implementation of the same urea-SCR technology as the orange one. It stays at
or near the legal limit on almost every route, with one exception — a rural
hilly route where it also spikes, to about 10 times the standard. I think
that third vehicle is actually the most important data point on this chart,
because it rules out the simple explanation. If diesel engines just
inherently got dirtier outside the lab, you'd expect all three cars to fail by
similar amounts. They didn't. Whatever was happening was specific to how
individual vehicles — or their control software — were built."

### [4:30–6:15] Slide 3 — The mechanism, and what the study did NOT establish

"[Advance to Slide 3.] So here's the question this chart raises: how does the
exact same physical car pass a test in a lab and then emit up to 35 times the
legal limit on a public road?

The honest answer is that both measurements can be individually correct. A
lab certification cycle — something like the FTP-75 cycle used here — is a
fixed, published speed-versus-time trace. It's the same every single time,
and manufacturers know exactly what it looks like years in advance, because
it's public. Real-world driving is never that. Every trip has a different
mix of speed, acceleration, road grade, and traffic. If a vehicle's control
system is *able to tell the difference* between the two — which, mechanically,
isn't even unusual; lots of vehicle systems adapt behavior to conditions —
it can legitimately produce two different, individually accurate readings
under the two conditions.

I want to be really careful here about what the WVU study itself did and
didn't establish, because this is the actual analytical lesson of this whole
case: **a measurement can be completely accurate under its own test
conditions and still fail to represent how the thing behaves in ordinary
use — especially if the system being measured can detect which condition
it's in and react to it.** That's true whether we're talking about emissions
tests, software benchmarks, or any other test a system might be able to
recognize.

What the study did *not* do: it didn't claim these three vehicles represent
the whole diesel fleet — the report says so itself, explicitly, in its own
executive summary — 'conclusions drawn from the data presented herein are
confined to these three vehicles.' Three cars is three case studies, not a
statistical sample. It didn't accuse anyone of intentional cheating — the
researchers floated genuinely innocent possible explanations, like the timing
of diesel particulate filter self-cleaning cycles. And it didn't identify the
cars by brand or model at all — WVU deliberately anonymized them as 'Vehicle
A, B, and C' specifically to keep the report from reading as an accusation
against any one manufacturer."

### [6:15–8:30] The handoff to investigation and outcome

"So a university publishes a report with an unexplained discrepancy and no
accusation. How does that become a $4.3 billion guilty plea?

That's where CARB — California's air regulator — and the EPA step in. Using
WVU's published results as the trigger, they went back to Volkswagen and
started asking increasingly specific questions about why the on-road and lab
numbers diverged. According to the Justice Department's own statement of facts
from January 2017, VW's response for the next year and a half was to offer a
series of technical explanations — mechanical issues, software updates framed
as durability fixes — while, internally, knowing the real cause.

The real cause, once investigators forced it into the open, was software:
code that could recognize when a car was undergoing the standard published
drive cycle — partly by detecting the exact test pattern, and in a later
refined version, even by sensing whether the steering wheel was moving, since
a car on a dynamometer drives in a straight line. When it detected a test, the
software ran the emissions controls at full strength. When it didn't, it
scaled them back — the DOJ's language is that this let cars emit up to 40
times the U.S. standard on the road. That's a broader number than WVU's three
cars — it's what the full investigation found across the actual defeat-device
mechanism, once regulators knew what to look for. That's the distinction I
want to leave you with: **the WVU study showed a discrepancy. The DOJ
investigation showed why.**

The consequences: roughly 590,000 affected diesel vehicles in the U.S. across
VW, Audi, and Porsche brands. Six VW executives indicted. Volkswagen pleaded
guilty to conspiracy, Clean Air Act violations, and obstruction of justice —
$2.8 billion in criminal penalties, another $1.5 billion in civil settlements,
for $4.3 billion total, plus a court-appointed compliance monitor for at least
three years."

### [8:30–9:15] Close

"The reason I think this case is worth studying isn't really the specific
numbers — it's the analytics lesson underneath it. A test result is only as
trustworthy as the assumption that the thing being tested can't tell it's
being tested. Every time we build a certification process, a benchmark, or an
automated check, we're implicitly making that same assumption. This case is
what happens when it's false — and it's also a reminder that the way it got
caught wasn't some dramatic investigative breakthrough. It was someone running
the same measurement under two different, ordinary conditions, and noticing
the numbers didn't match. That's it. That's the whole method."

---

**Total: ~9:00.** If you need to trim to 8:00, cut the steering-wheel-detection
detail in the handoff section (saves ~20s) and shorten the "third vehicle"
discussion in Slide 2 to one sentence (saves ~30s).

import assert from "node:assert/strict";
import test from "node:test";
import { parseGroupPage } from "./parser";

function reportId(url: string | undefined): string | undefined {
  return url?.match(/meeting=(\d+)/)?.[1];
}

test("parses a group-phase result without a venue column", () => {
  const html = `
    <h1>HTV-Pokal 2026 Damen 35 - Generali LK 1,0-25,0 Gr. 005</h1>
    <table class="result-set">
      <tr>
        <th colspan="3">Datum</th>
        <th>Heimmannschaft</th>
        <th>Gastmannschaft</th>
        <th>Matchpunkte</th>
        <th>Sätze</th>
        <th>Spiele</th>
        <th>Spielbericht</th>
      </tr>
      <tr>
        <td>Di</td>
        <td>09.06.2026 18:00</td>
        <td>&nbsp;</td>
        <td><a href="/teamPortrait?team=3675394">Wiesbadener THC</a></td>
        <td><a href="/teamPortrait?team=3730433">TC Dietesheim</a></td>
        <td>1:2</td>
        <td>2:4</td>
        <td>17:27</td>
        <td><a href="/meetingReport?meeting=12910550&amp;federation=HTV">anzeigen</a></td>
      </tr>
    </table>
  `;

  const group = parseGroupPage(html, 2026, "5");
  assert.equal(group.matches.length, 1);
  assert.equal(group.matches[0]?.homeTeam, "Wiesbadener THC");
  assert.equal(group.matches[0]?.awayTeam, "TC Dietesheim");
  assert.equal(group.matches[0]?.matchPoints, "1:2");
  assert.equal(group.matches[0]?.isPlayed, true);
  assert.equal(reportId(group.matches[0]?.reportUrl), "12910550");
});

test("keeps group-phase matches when Spielort shifts the team columns", () => {
  const html = `
    <h1>HTV-Pokal 2026 Herren - Generali LK 1,0-25,0 Gr. 010</h1>
    <table class="result-set">
      <tr>
        <th colspan="3">Datum</th>
        <th>Spielort</th>
        <th>Heimmannschaft</th>
        <th>Gastmannschaft</th>
        <th>Matchpunkte</th>
        <th>Sätze</th>
        <th>Spiele</th>
        <th>Spielbericht</th>
      </tr>
      <tr>
        <td>Di</td>
        <td>09.06.2026 18:00</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td><a href="/teamPortrait?team=1">VfR Wiesbaden</a></td>
        <td><a href="/teamPortrait?team=2">TC Kelsterbach</a></td>
        <td>1:2</td>
        <td>2:5</td>
        <td>18:31</td>
        <td><a href="/meetingReport?meeting=12910618">anzeigen</a></td>
      </tr>
      <tr>
        <td class="tabelle-rowspan">&nbsp;</td>
        <td class="tabelle-rowspan">&nbsp;</td>
        <td class="tabelle-rowspan">&nbsp;</td>
        <td>SKG Frankfurt</td>
        <td><a href="/teamPortrait?team=3">VfR Wiesbaden</a></td>
        <td><a href="/teamPortrait?team=4">SKG Frankfurt</a></td>
        <td>2:1</td>
        <td>4:2</td>
        <td>28:20</td>
        <td><a href="/meetingReport?meeting=12910590">anzeigen</a></td>
      </tr>
    </table>
  `;

  const group = parseGroupPage(html, 2026, "10");
  assert.equal(group.matches.length, 2);
  assert.deepEqual(
    group.matches.map((match) => ({
      date: match.date,
      home: match.homeTeam,
      away: match.awayTeam,
      score: match.matchPoints,
      meeting: reportId(match.reportUrl),
      played: match.isPlayed,
    })),
    [
      {
        date: "09.06.2026 18:00",
        home: "VfR Wiesbaden",
        away: "TC Kelsterbach",
        score: "1:2",
        meeting: "12910618",
        played: true,
      },
      {
        date: "09.06.2026 18:00",
        home: "VfR Wiesbaden",
        away: "SKG Frankfurt",
        score: "2:1",
        meeting: "12910590",
        played: true,
      },
    ],
  );
});

test("parses 2023 knockout rows that have Nr. and no Spielort", () => {
  const html = `
    <h1>HTV-Pokal 2023 Damen Nebenrunde</h1>
    <table class="result-set">
      <tr>
        <th colspan="3">Datum</th>
        <th>Nr.</th>
        <th>Heimmannschaft</th>
        <th>Gastmannschaft</th>
        <th>Matchpunkte</th>
        <th>Sätze</th>
        <th>Spiele</th>
        <th>Spielbericht</th>
      </tr>
      <tr>
        <td>Sa</td>
        <td>16.09.2023 11:00</td>
        <td>&nbsp;</td>
        <td>1</td>
        <td><a href="/teamPortrait?team=9">TC A</a></td>
        <td><a href="/teamPortrait?team=8">TC B</a></td>
        <td>3:0</td>
        <td>6:0</td>
        <td>36:10</td>
        <td><a href="/meetingReport?meeting=100">anzeigen</a></td>
      </tr>
    </table>
  `;

  const group = parseGroupPage(html, 2023, "1863412");
  assert.equal(group.isKnockout, true);
  assert.equal(group.matches.length, 1);
  assert.equal(group.matches[0]?.homeTeam, "TC A");
  assert.equal(group.matches[0]?.awayTeam, "TC B");
  assert.equal(group.matches[0]?.matchPoints, "3:0");
  assert.equal(reportId(group.matches[0]?.reportUrl), "100");
});

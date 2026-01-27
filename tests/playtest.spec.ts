import { test, expect, BrowserContext, Page } from '@playwright/test';

test('multiplayer flow test', async ({ browser }) => {
  // Setup Host
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  await hostPage.goto('http://localhost:5173');
  await hostPage.click('text=HOST');
  
  // Wait for room code
  const roomCodeElement = hostPage.locator('div[class*="text-[14rem]"]');
  await expect(roomCodeElement).toBeVisible({ timeout: 10000 });
  const roomCode = await roomCodeElement.innerText();
  console.log('Room Code:', roomCode);

  // Setup Player 1
  const p1Context = await browser.newContext();
  const p1Page = await p1Context.newPage();
  await p1Page.goto(`http://localhost:5173?code=${roomCode}`);
  await p1Page.fill('input[placeholder="YOUR NAME"]', 'Player 1');
  await p1Page.click('text=Jump In!');

  // Setup Player 2
  const p2Context = await browser.newContext();
  const p2Page = await p2Context.newPage();
  await p2Page.goto(`http://localhost:5173?code=${roomCode}`);
  await p2Page.fill('input[placeholder="YOUR NAME"]', 'Player 2');
  await p2Page.click('text=Jump In!');

  // Host starts game
  await hostPage.click('text=LFG!');
  
  // Host selects Trivia
  await hostPage.click('text=Trivia');
  
  // Players answer
  await p1Page.click('text=A');
  await p2Page.click('text=B');
  
  // Host proceeds
  await hostPage.click('text=Next Step');
  
  // Verify results state
  await expect(hostPage.locator('text=Hall of Fame')).toBeVisible();
});

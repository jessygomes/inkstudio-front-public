import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('non-régression : le formulaire contact et la messagerie clients restent disponibles', () => {
  assert.ok(existsSync(new URL('./components/Contact/PublicProfileContactForm.tsx', import.meta.url)));
  assert.ok(existsSync(new URL('./app/(root)/mon-profil/messagerie/[id]/page.tsx', import.meta.url)));
});

test('une action authentifiée démarre ou réutilise la conversation depuis le profil public', () => {
  const actions = source('./lib/actions/conversation.action.ts');
  assert.match(actions, /startConversationFromPublicProfileAction/);
  assert.match(actions, /\/messaging\/conversations\/start/);
  assert.match(actions, /getAuthHeaders/);
});

test('seuls les profils payants proposent le bouton et le client accède à son fil existant', () => {
  const page = source('./app/(root)/salon/[slug]/[loc]/page.tsx');
  const button = source('./components/Contact/StartInkeraConversationButton.tsx');
  assert.match(page, /!isFree\s*&&\s*<StartInkeraConversationButton/);
  assert.match(button, /\/mon-profil\/messagerie\//);
  assert.match(button, /\/se-connecter/);
  assert.match(button, /session\?\.user\?\.role/);
});

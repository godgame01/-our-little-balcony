# Our Little Balcony ❤️

A mobile-friendly private multiplayer balcony for two people.

## Included
- One shared room link (`?room=...`) for both Android phones
- Synchronized fireworks: tap the sky or press **Launch fireworks**
- Two guest slots with presence indicator
- Live room chat
- Shared music on/off signal (each phone generates a gentle original synth melody locally)
- Shared photo wall (photos are relayed to both guests and held in server memory while the room exists)
- Responsive romantic balcony scene with two illustrated avatars

## Run locally
Requires Node.js 18+.

```bash
npm install
npm start
```

Open `http://localhost:3000` on your computer. To test on two phones on the same Wi-Fi, open the computer's LAN IP and port 3000 on both.

## Put it online
Deploy this folder to a Node.js host that supports WebSockets (for example, Render, Railway, or a VPS). Set the start command to `npm start`. Use the public HTTPS URL on both phones.

After deployment:
1. Open the website and enter a name and a room name.
2. Tap **Open our balcony**.
3. Tap **Copy invite link** and send that link to your friend.
4. Your friend opens the same link and enters their name.

## Important limitations for this starter version
- This is a working starter project, not yet deployed to a public URL. A hosted Node.js server is required for two people in different places to share a room.
- Room membership and photos are kept in server memory, not a permanent database. If the server restarts or both guests leave, room state/photos are cleared.
- Photos are limited to 2.5 MB per upload and the server retains up to 12 photos per active room. For public production use, add authentication, moderation, persistent private storage, rate limits, and HTTPS (the hosting platform usually provides HTTPS).
- The two-avatar scene is a lightweight illustrated 2D/2.5D visual, not a full 3D game. Fireworks are synchronized between connected guests.
- Music is a simple original synthesized melody generated on each phone; the play/pause state is synchronized, but exact audio timing can vary by browser/device.
- Only two people can occupy a room at once.

import os
import re

directory = '/Users/yaeger/Desktop/Projects/infra_agent/infra/landing-pages/gamewithfam/client/src/games'

pattern = r"<LeaderboardOverlay entries=\{Object\.values\(players\)\} \/>"
replacement = r"<LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost)} />"

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            if re.search(pattern, content):
                new_content = re.sub(pattern, replacement, content)
                with open(path, 'w') as f:
                    f.write(new_content)
                print(f"Updated {file} in {os.path.basename(os.path.dirname(root))}/{os.path.basename(root)}")


with open("frontend/src/app/page.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'const [image, setImage] = useState<File | null>(null);',
    '// const [image, setImage] = useState<File | null>(null);'
)
content = content.replace(
    'setImage(file);',
    '// setImage(file);'
)

with open("frontend/src/app/page.tsx", "w") as f:
    f.write(content)

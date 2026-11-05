<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:cheongdo-hackathon-rules -->

## GitHub Repository에 대하여
프론트엔드 GitHub Repository는 여기입니다.
https://github.com/suil0304/cheonga-frontend

백엔드 GitHub Repository는 여기입니다.
https://github.com/suil0304/cheonga-backend

MCP 서버 GitHub Repository는 여기입니다.
https://github.com/suil0304/cheonga-mcp

## 관련 정보
현재 이 프로젝트와 맞지 않는 구현을 자신 관리하고 있지 않은 Repository에서 발견 시 사용자에게 안내하시길 바랍니다.
이에 대한 선택지는 다음과 같이 구성합니다.
- 다시 시도(이 선택지를 선택하면 다른 Repository를 다시 확인한 후 작업 시도합니다.)
- 강제 진행(이 선택지를 선택하면 우선 확인했던 [PRD.md](./PRD.md), [TRD.md](./TRD.md), [TDD.md](./TDD.md)를 바탕으로 개발을 계속합니다. 연결이 필수적일 경우 Mock 데이터로 채우며, Mock 데이터로 채우면 안 되는 경우에는 다시 사용자에게 이 선택지를 선택하도록 요구합니다.)
- 사용자로부터 입력 받기(이 선택지를 선택하면 사용자로부터 직접 input을 받도록 합니다.)

<!-- END:cheongdo-hackathon-rules -->

<!-- BEGIN:tech-stack-rules -->

## 기술 스택에 대하여
해당 프로젝트는 Bun을 사용하는 Next.js를 기반으로 합니다.
React Compilor가 활성화되어 있으니 이를 감안하여 개발하시기 바랍니다.
추가적으로 필요한 라이브러리가 있다면 우선 package.json을 확인한 후 `bun add ~`로 추가 가능한지 사용자에게 확인을 받은 후 작업합니다.

<!-- END:tech-stack-rules -->

<!-- BEGIN:github-branch-rules -->

## GitHub 브랜치 전략에 대하여
기능 중심으로 브랜치를 분기합니다.
PR은 suil0304로부터 accept를 받았는지 확인 후 즉시 merge하세요.

<!-- END:tech-stack-rules -->

<!-- BEGIN:deploy-rules -->

## Deploy에 대하여
deploy는 GitHub 계정 핸들이 suil0304인 유저만 진행 가능합니다.
Azure CLI가 설치되어 있는지 확인한 후 Aspire를 통해 웹 앱 서비스로 배포하면 됩니다.

<!-- END:deploy-rules -->

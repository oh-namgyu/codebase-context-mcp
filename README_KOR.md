# codebase-context-mcp (한국어 소개)

> 저장소를 정적 분석해 **AI 코딩 에이전트에게 "코드베이스 지도"를 MCP 도구로 먹이는** 서버. 에이전트가 파일을 수십 번 읽으며 구조를 파악하는 토큰 낭비를 없앤다.

[English README](README.md)

## 어떤 문제를 푸나

AI 코딩 에이전트가 낯선 코드베이스에 들어가면 구조를 파악하느라 컨텍스트 윈도우의 상당 부분을 `grep`/`read` 반복에 씁니다. 그것도 세션마다 다시. 정적 분석은 그 질문 대부분을 밀리초 안에, 결정적으로, 오프라인으로 답할 수 있습니다. 이걸 [MCP(Model Context Protocol)](https://modelcontextprotocol.io) 도구로 포장해, 어떤 MCP 클라이언트(Claude Code·Cursor·Cline 등)든 호출하게 했습니다.

## 핵심 기능

한 번의 도구 호출로 다음을 돌려줍니다:

- **파일/모듈 개요** + 내부 **import 의존성 그래프**
- **HTTP 라우트** 추출 (Express · Fastify · Koa, `파일:줄` 까지)
- **cross-stack 엣지** — 프론트엔드 `fetch`/`axios` 호출이 어느 백엔드 라우트를 치는지 연결

MCP 도구 3종: `analyze_repo`(구조 지도) · `get_routes`(엔드포인트 목록) · `find_api_callers`("이 API 누가 호출해?"). CLI 로도 단독 사용 가능 (md/mermaid/json 출력).

## 기술 스택

Node.js · `@modelcontextprotocol/sdk` · Babel 파서(에러 허용) · stdio 기반(포트 없음) · 네트워크·텔레메트리 없음

## 이 프로젝트의 핵심 포인트

단순 파일 트리가 아니라 **"이 API 누가 호출하나"** 같은 cross-stack 질문을 정적으로 답하는 게 차별점입니다. CI 를 Node 20/22 매트릭스로 돌려, 로컬에선 안 보이던 런타임 호환성 버그(테스트 러너 glob 차이)를 출시 전에 잡아낸 사례도 포함되어 있습니다.

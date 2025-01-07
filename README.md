# 🔮 VisAIR (prototype)

*<u>Vis</u>ualizing <u>A</u>rtificial <u>I</u>ntelligence <u>R</u>easoning*

This prototype visualizes Multi-Persona Self-Collaboration in large language models. You are expected to bring your own OpenAI API key. This project currently uses the [OpenAI GPT-4o-mini model](https://platform.openai.com/docs/models#gpt-4o-mini) in combination with the [Assistants API](https://platform.openai.com/docs/assistants/overview).

> [!NOTE]
> Your API key is only stored in your browser's LocalStorage. It is not sent anywhere. Nevertheless, you should be careful entering your API key anywhere. It is recommended you understand the source code and then get this project running locally to use it from there.

> [!WARNING]
> This repository will not be maintained actively. It was created as a prototype/proof-of-concept for fun and learning purposes. It is provided as-is and without any guarantees.

## 🚀 Getting Started

1. Clone the repository:

  ```bash
  git clone
  ```

2. Install dependencies:

  ```bash
  npm install
  ```

3. Start the server and open the app in a new browser tab:

  ```bash
  npm run dev -- --open
  ```

4. Enter your API key and click 'Log In'

5. Finally enter a prompt and let the process flow. Currently it should work best if you give a concrete task.

## 🖼 Media

https://github.com/user-attachments/assets/dbe4919e-3148-48c3-bcc6-9c4dc3e0eed4

## 🔬 Background

While letting OpenAI-o1 write some mundane code for me, I noticed that at one point it slipped up and showed a name in its reasoning details. This made me think it could work by combining multiple personas to solve tasks. As a fun exercise I decided to build this prototype to visualize this reasoning process.

<div align="center">

[<img src="./docs/o1-slip-up.jpg" alt="Chat with GPT-o1 showing a name in its reasoning details, the name is circled" width="250">](./docs/o1-slip-up.jpg)

</div>

*During my research I ran into this interesting paper: [*Unleashing Cognitive Synergy In Large Language Models: A Task-Solving Agent Through Multi-Persona Self-Collaboration* (paper)](https://arxiv.org/abs/2307.05300)*

## ❓ How it works

1. Your task prompt is first fed through two preprocessors (both `gpt-4o-mini`):

    a. [the first preprocessor](https://github.com/luttje/visair/blob/86703cef8a0f9584b83b35a8fb763087c96f050a/src/lib/assistants/configs/prompts/breakIntoParts.md) will break your task into smaller steps. It makes note of dependencies between steps.

    b. [The second preprocessor](https://github.com/luttje/visair/blob/86703cef8a0f9584b83b35a8fb763087c96f050a/src/lib/assistants/configs/prompts/organizeForExperts.md) will divide the tasks of the previous preprocessor over multiple expertises. It makes note of any dependencies between expertises.

2. The preprocessed task is then fed to [a 'Project Lead' AI assistant](https://github.com/luttje/visair/blob/86703cef8a0f9584b83b35a8fb763087c96f050a/src/lib/assistants/configs/prompts/projectLead.md). This assistant will create personas (other assistants) using [a tool call](https://github.com/luttje/visair/blob/86703cef8a0f9584b83b35a8fb763087c96f050a/src/lib/assistants/configs/projectLeadAssistant.ts#L19-L61) and will immediately give them their first step, as per the preprocessed task.

3. The reply of each persona is interpreted by the project lead. If the persona has completed their step, the project lead will give them the next step. If the step isn't succesfully executed, the project lead should use [a different tool call](https://github.com/luttje/visair/blob/86703cef8a0f9584b83b35a8fb763087c96f050a/src/lib/assistants/configs/projectLeadAssistant.ts#L62-L92) to send additional instructions to the persona.

4. The project lead will continue to manage the personas until the task is completed. For personas that have dependencies on other personas, the project lead will manage the order in which they are given their steps.

5. Once all personas have completed all their steps and the Project Lead has confirmed the task is completed, the project lead will give you the final result.

6. At that point a chat input with the Project Lead will be available for you to give further instructions or ask questions.

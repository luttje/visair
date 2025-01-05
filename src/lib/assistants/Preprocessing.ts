import type { AssistantClient } from "./AssistantClient";

export type PreprocessingJob = {
  preprocessor: PreprocessingProcessor;
  result: string;
  status: 'pending' | 'processing' | 'completed';
  onChanged?: () => void;
  // HACK: I really need to clean up how I mangle reactivity
  index?: number;
};

export type PreprocessingProcessor = {
  name: string;
  color: { text: string, background: string };
  instructions: string;
  process: (client: AssistantClient, promptResult: string | undefined, originalPrompt: string) => Promise<string>;
};

export class PreprocessingPipeline {
  private readonly jobs: PreprocessingJob[] = [];
  private currentJobIndex = -1;
  private client: AssistantClient;
  private jobChangedCallback: (job: PreprocessingJob) => void = () => { };

  constructor(context: AssistantClient) {
    this.client = context;
  }

  public addJob(preprocessor: PreprocessingProcessor): void {
    this.jobs.push({
      preprocessor,
      result: '',
      status: 'pending',
    });
  }

  public addJobRange(preprocessors: PreprocessingProcessor[]): void {
    for (const preprocessor of preprocessors) {
      this.addJob(preprocessor);
    }
  }

  public addJobChangedCallback(callback: (job: PreprocessingJob) => void): void {
    this.jobChangedCallback = callback;
  }

  public getJobs(): PreprocessingJob[] {
    return this.jobs;
  }

  public getJobsWithoutPending(): PreprocessingJob[] {
    return this.jobs.filter(job => job.status !== 'pending');
  }

  public getCurrentJob(): PreprocessingJob | undefined {
    if (this.currentJobIndex === -1) {
      return undefined;
    }

    return this.jobs[this.currentJobIndex];
  }

  public getCurrentJobIndex(): number {
    return this.currentJobIndex;
  }

  public reset(): void {
    for (const job of this.jobs) {
      job.result = '';
      job.status = 'pending';

      this.jobChangedCallback?.(job);
    }
  }

  /**
   * Start with a user prompt, then process it through each preprocessor in the pipeline.
   * The result of each preprocessor is passed to the next preprocessor in the pipeline.
   *
   * TODO: This might be risky if the preprocessors hallucinate/mangle the original prompt.
   * TODO: Perhaps we should combine the original prompt again
   */
  public async start(originalPrompt: string): Promise<string> {
    let promptResult: string | undefined = undefined;
    this.reset();

    for (let i = 0; i < this.jobs.length; i++) {
      const job = this.jobs[i];

      if (job.status === 'completed') {
        throw new Error('Job has already been completed. Reset the pipeline to start again.');
      }

      this.currentJobIndex = i;
      job.status = 'processing';
      job.onChanged?.();
      this.jobChangedCallback?.(job);

      promptResult = await job.preprocessor.process(this.client, promptResult, originalPrompt);

      job.result = promptResult;
      job.status = 'completed';
      job.onChanged?.();
      this.jobChangedCallback?.(job);
      this.currentJobIndex = -1;
    }

    if (promptResult === undefined) {
      throw new Error('Prompt result is undefined. This should not happen.');
    }

    return promptResult;

  }
}

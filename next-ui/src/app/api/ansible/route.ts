import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    writer.write(encoder.encode(`data: Starting Ansible execution...\n\n`));
    
    const command = 'ansible-playbook';
    const args = [
      '-i', '/tmp/data/inventory.ini',
      '/tmp/data/main.yml',
      '-vv',  // Add verbose output
      '-e', `PROJECT_NAME=${data.projectname}`,
      '-e', `ANSIBLE_USER=${data.ansible_login}`,
      '-e', `EXTERNAL_PORT=${data.external_server_port}`,
      '-e', `DEPLOY_SERVER_ADDRESS=${data.deploy_server_ip}`,
      '-e', `SEMAPHORE_PROJECT_ID=${data.projectId}`,
      '-e', `TARGET=${data.deploy_target}`
    ];

    // Add FORCE_COLOR to preserve color output
    const env = { ...process.env, FORCE_COLOR: 'true', ANSIBLE_FORCE_COLOR: 'true' };
    const ansible = spawn(command, args, { env });

    ansible.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          writer.write(encoder.encode(`data: ${line}\n\n`));
        }
      }
    });

    ansible.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          writer.write(encoder.encode(`data: ${line}\n\n`));
        }
      }
    });

    ansible.on('close', async (code) => {
      writer.write(encoder.encode(`data: Process completed with code ${code}\n\n`));
      await writer.close();
    });

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Ansible execution error:', error);
    return NextResponse.json({ 
      output: 'Failed to execute Ansible playbook: ' + error.message,
      success: false 
    }, { status: 500 });
  }
}
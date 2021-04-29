import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';

@injectable()
export class SmartclideServiceCreationTheiaWidget extends ReactWidget {

    static readonly ID = 'smartclide-service-creation-theia:widget';
    static readonly LABEL = 'Smartclide Service Creation Widget';
	static state = {
		stateServiceURL: '',
		stateName: '',
		stateGitlabURL: '',
		stateGitlabToken: '',
		stateJenkinsURL: '',
		stateJenkinsUser: '',
		stateJenkinsToken:''
	};
	
    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @postConstruct()
    protected async init(): Promise < void> {
        this.id = SmartclideServiceCreationTheiaWidget.ID;
        this.title.label = SmartclideServiceCreationTheiaWidget.LABEL;
        this.title.caption = SmartclideServiceCreationTheiaWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-cogs';
		
        this.update();
    }

    protected render(): React.ReactNode {
        const header = `Provide the information required to create the auto CI.`;
        
		return <div id='widget-container'>
            <AlertMessage type='INFO' header={header} />
            <div id='info'>
				<table>
					<tbody>
					  <tr>
						<td className='cellID'>Service Creation URL</td>
						<td>
							<input onChange={this.updateInput} placeholder='Service' name='stateServiceURL'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>Project Name</td>
						<td>
							<input onChange={this.updateInput} maxLength={100} placeholder='Name' name='stateName'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>GitLab Server URL</td>
						<td>
							<input onChange={this.updateInput} placeholder='URL' name='stateGitlabURL'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>GitLab Token</td>
						<td>
							<input type='password' onChange={this.updateInput} placeholder='Token' name='stateGitlabToken'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>Jenkins Server Url</td>
						<td>
							<input onChange={this.updateInput} placeholder='URL' name='stateJenkinsURL'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>Jenkins Username</td>
						<td>
							<input onChange={this.updateInput} maxLength={100} placeholder='Username' name='stateJenkinsUser'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>Jenkins Token</td>
						<td>
							<input type='password' onChange={this.updateInput} placeholder='Token' name='stateJenkinsToken'/>
						</td>
					  </tr>
					</tbody>
				</table>
            </div>
			<button className='theia-button secondary' title='Create' onClick={_a => this.runprocess()}>Run</button>
			<i id='message'></i>
		</div>
    }

    protected runprocess(): void {
		//if all the fields have values
		if(SmartclideServiceCreationTheiaWidget.state.stateServiceURL!='' &&
		   SmartclideServiceCreationTheiaWidget.state.stateName!='' && SmartclideServiceCreationTheiaWidget.state.stateGitlabURL!='' &&
		   SmartclideServiceCreationTheiaWidget.state.stateGitlabToken!='' && SmartclideServiceCreationTheiaWidget.state.stateJenkinsURL!='' &&
		   SmartclideServiceCreationTheiaWidget.state.stateJenkinsUser!='' && SmartclideServiceCreationTheiaWidget.state.stateJenkinsToken!='')
		{
			//post request
			fetch(SmartclideServiceCreationTheiaWidget.state.stateServiceURL+'/createStucture', {
				method: 'post',
				headers: {
					'Accept': '*/*',
					'Access-Control-Allow-Origin': '*',
					'projectName' : SmartclideServiceCreationTheiaWidget.state.stateName,
					'gitLabServerURL' : SmartclideServiceCreationTheiaWidget.state.stateGitlabURL,
					'gitlabToken' : SmartclideServiceCreationTheiaWidget.state.stateGitlabToken,
					'jenkinsServerUrl' : SmartclideServiceCreationTheiaWidget.state.stateJenkinsURL,
					'jenkinsUsername' : SmartclideServiceCreationTheiaWidget.state.stateJenkinsUser,
					'jenkinsToken' : SmartclideServiceCreationTheiaWidget.state.stateJenkinsToken
				}
			}).then(res => res.json())
			  .then((out) => {
					var obj = JSON.parse(JSON.stringify(out));
					
					//show message get from service
					(document.getElementById("message") as HTMLElement).style.display = "block";
					(document.getElementById('message') as HTMLElement).innerHTML = obj.message;
					
					//check post request status
					if (obj.status==0){
						this.messageService.info('Successful Execution');
					}
					else{
						this.messageService.info('Error In Execution');
					}
			  })
			  .catch(err => {
				console.log('err: ', err);
				(document.getElementById("message") as HTMLElement).style.display = "block";
				(document.getElementById('message') as HTMLElement).innerHTML = 'Error With Service';
			  });
		}
		else{
			(document.getElementById("message") as HTMLElement).style.display = "none";
			this.messageService.info('Provide values for all fields');
		}
    }

	//update the state
	updateInput (e: React.ChangeEvent<HTMLInputElement>) {
		const key =e.currentTarget.name as keyof typeof SmartclideServiceCreationTheiaWidget.state
		SmartclideServiceCreationTheiaWidget.state[key] = e.currentTarget.value;
    }
}

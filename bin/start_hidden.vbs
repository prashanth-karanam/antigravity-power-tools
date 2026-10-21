Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strConfigPath = WshShell.ExpandEnvironmentStrings("%USERPROFILE%\.gemini\config\power-tools\power_daemon.js")
strLocalPath = fso.GetParentFolderName(WScript.ScriptFullName) & "\power_daemon.js"

targetScript = strLocalPath
If fso.FileExists(strConfigPath) Then
  targetScript = strConfigPath
End If

WshShell.Run "node """ & targetScript & """", 0, False
